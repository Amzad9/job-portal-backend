import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogCategories,
} from "../controllers/blogController.js";

const router = express.Router();

router.route("/").get(getBlogs).post(createBlog);
router.route("/categories").get(getBlogCategories);
router.route("/slug/:slug").get(getBlogBySlug);
router.route("/:id").put(updateBlog).delete(deleteBlog);

export default router;

