import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from "../controllers/contactController.js";

const router = express.Router();

router.route("/").post(createContact).get(getContacts);
router.route("/stats").get(getContactStats);
router.route("/:id").get(getContactById).put(updateContactStatus).delete(deleteContact);

export default router;

