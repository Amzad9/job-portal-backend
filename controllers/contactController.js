import Contact from "../models/Contact.js";

// Create a new contact submission
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    await contact.save();
    res.status(201).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact submissions (for admin)
export const getContacts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "name") {
      sortOption = { name: 1 };
    }

    const contacts = await Contact.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-ipAddress -userAgent"); // Exclude sensitive info

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      contacts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get contact by ID (for admin)
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact submission not found" });
    }

    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update contact status (for admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["new", "read", "replied", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (new, read, replied, archived)",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact submission not found" });
    }

    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete contact submission (for admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact submission not found" });
    }

    res.json({ success: true, message: "Contact submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get contact statistics (for admin)
export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newCount = await Contact.countDocuments({ status: "new" });
    const readCount = await Contact.countDocuments({ status: "read" });
    const repliedCount = await Contact.countDocuments({ status: "replied" });
    const archivedCount = await Contact.countDocuments({ status: "archived" });

    res.json({
      success: true,
      stats: {
        total,
        new: newCount,
        read: readCount,
        replied: repliedCount,
        archived: archivedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

