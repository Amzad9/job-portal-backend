import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Stripe from "stripe";

// Initialize Stripe only if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.warn("⚠️  Stripe not configured. Set STRIPE_SECRET_KEY to enable payment features.");
}

// Subscription plans configuration
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    jobPostsLimit: 3,
    featuredJobsPerMonth: 0,
    analytics: false,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    jobPostsLimit: -1, // unlimited
    featuredJobsPerMonth: 2,
    analytics: true,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    jobPostsLimit: -1, // unlimited
    featuredJobsPerMonth: -1, // unlimited
    analytics: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
  },
};

// Get user's subscription
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id }).populate("user");

    if (!subscription) {
      // Create free subscription if doesn't exist
      const newSubscription = await Subscription.create({
        user: req.user._id,
        plan: "free",
        status: "active",
        features: PLANS.free,
      });

      await User.findByIdAndUpdate(req.user._id, { subscription: newSubscription._id });

      return res.status(200).json({
        success: true,
        subscription: newSubscription,
        plan: PLANS.free,
      });
    }

    const planDetails = PLANS[subscription.plan] || PLANS.free;

    res.status(200).json({
      success: true,
      subscription,
      plan: planDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching subscription",
    });
  }
};

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.",
      });
    }

    const { plan } = req.body;

    if (!["pro", "enterprise"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const planDetails = PLANS[plan];
    if (!planDetails.priceId) {
      return res.status(400).json({
        success: false,
        message: "Stripe price ID not configured for this plan",
      });
    }

    // Get or create Stripe customer
    let subscription = await Subscription.findOne({ user: req.user._id });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.companyName || req.user.name,
        metadata: {
          userId: req.user._id.toString(),
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/account?canceled=true`,
      metadata: {
        userId: req.user._id.toString(),
        plan: plan,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating checkout session",
    });
  }
};

// Handle Stripe webhook
export const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: "Stripe is not configured",
    });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed. ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper functions for webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;

  let subscription = await Subscription.findOne({ user: userId });

  if (subscription) {
    subscription.plan = plan;
    subscription.status = "active";
    subscription.stripeCustomerId = session.customer;
    subscription.stripeSubscriptionId = session.subscription;
    subscription.features = PLANS[plan];
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      user: userId,
      plan: plan,
      status: "active",
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      features: PLANS[plan],
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await User.findByIdAndUpdate(userId, { subscription: subscription._id });
  }
}

async function handleSubscriptionUpdate(subscription) {
  const dbSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (dbSubscription) {
    dbSubscription.status = subscription.status;
    dbSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    dbSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    dbSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

    if (subscription.status === "canceled") {
      dbSubscription.canceledAt = new Date();
      // Downgrade to free plan
      dbSubscription.plan = "free";
      dbSubscription.features = PLANS.free;
    }

    await dbSubscription.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (subscription) {
    subscription.status = "active";
    subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
    subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
    await subscription.save();
  }
}

async function handlePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (subscription) {
    subscription.status = "past_due";
    await subscription.save();
  }
}

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error canceling subscription",
    });
  }
};

// Get billing portal URL
export const getBillingPortal = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating billing portal session",
    });
  }
};

