import express from "express";
import {
  getSubscription,
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getBillingPortal,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Webhook must be before protect middleware (Stripe sends raw body)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Protected routes
router.get("/", protect, getSubscription);
router.post("/checkout", protect, createCheckoutSession);
router.post("/cancel", protect, cancelSubscription);
router.get("/billing-portal", protect, getBillingPortal);

export default router;

