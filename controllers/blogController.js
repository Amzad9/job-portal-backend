import Blog from "../models/Blog.js";

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, authorRole, image, category, readTime, tags, status, metaTitle, metaDescription, isFeatured } = req.body;

    if (!title || !excerpt || !content || !author || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, excerpt, content, author, image, and category are required",
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Ensure slug is unique
    let existingBlog = await Blog.findOne({ slug });
    let counter = 1;
    while (existingBlog) {
      slug = `${generateSlug(title)}-${counter}`;
      existingBlog = await Blog.findOne({ slug });
      counter++;
    }

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      author,
      authorRole: authorRole || "Content Writer",
      publishDate: req.body.publishDate || new Date(),
      image,
      category,
      readTime: readTime || "5 min read",
      tags: tags || [],
      status: status || "published",
      isFeatured: isFeatured || false,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
    });

    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all blog posts
export const getBlogs = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 20,
      sort = "newest",
      all = false,
    } = req.query;

    const query = all ? {} : { status: "published" };

    if (status && all) {
      query.status = status;
    }

    if (category) {
      query.category = new RegExp(category, "i");
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortOption = { isFeatured: -1, publishDate: -1 }; // Featured posts first, then by date

    if (sort === "oldest") {
      sortOption = { isFeatured: -1, publishDate: 1 };
    } else if (sort === "title") {
      sortOption = { isFeatured: -1, title: 1 };
    }

    const blogs = await Blog.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-content"); // Exclude full content from list

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get blog post by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If title is being updated, regenerate slug
    if (updateData.title) {
      let slug = generateSlug(updateData.title);
      let existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      let counter = 1;
      while (existingBlog) {
        slug = `${generateSlug(updateData.title)}-${counter}`;
        existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
        counter++;
      }
      updateData.slug = slug;
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete blog post
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category", { status: "published" });
    res.json({ success: true, categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

