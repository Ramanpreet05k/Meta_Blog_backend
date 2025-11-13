import Blog from "../models/blog.model.js";
import fs from "fs";
import path from "path";

// Get all blogs
export const allBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ blogs, success: true, message: "All blogs" });
  } catch (error) {
    console.error("allBlogs error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Blog image is required", success: false });
    }
    const image_filename = req.file.filename;

    const blog = await Blog.create({
      title,
      category,
      description,
      image: image_filename,
      author: {
        id: req.user._id,
        name: req.user.name,
        image: req.user.image,
      },
    });

    return res.status(201).json({ message: "Blog created", success: true, blog });
  } catch (error) {
    console.error("createBlog error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found", success: false });
    }

    if (blog.author.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this blog", success: false });
    }

    // Delete image file safely
    const imagePath = path.join("uploads", blog.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.warn("Failed to delete image file:", err);
    });

    await blog.deleteOne();
    return res.status(200).json({ message: "Blog deleted successfully", success: true });
  } catch (error) {
    console.error("deleteBlog error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get single blog
export const singleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found", success: false });
    }
    return res.status(200).json({ message: "Blog found", success: true, blog });
  } catch (error) {
    console.error("singleBlog error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get blogs by logged-in user
export const userBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ "author.id": req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: "User blogs", blogs });
  } catch (error) {
    console.error("userBlogs error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

