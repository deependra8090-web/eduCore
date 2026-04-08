import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import config from "../config.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

/* ---------------- CREATE COURSE ---------------- */

export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  try {
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { image } = req.files;

    const allowedFormat = ["image/png", "image/jpeg"];

    if (!allowedFormat.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ error: "Invalid file format. Only PNG and JPG allowed" });
    }

    const cloud_response = await cloudinary.uploader.upload(
      image.tempFilePath
    );

    if (!cloud_response) {
      return res.status(400).json({ error: "Error uploading to Cloudinary" });
    }

    const course = await Course.create({
      title,
      description,
      price: numericPrice,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      },
      creatorId: adminId,
    });

    res.json({
      message: "Course created successfully",
      course,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating course" });
  }
};

/* ---------------- UPDATE COURSE ---------------- */
export const updateCourse = async (req, res) => {
  const adminId = req.adminId;

  try {
    const { id: courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found or unauthorized",
      });
    }

    if (course.creatorId && course.creatorId.toString() !== adminId) {
      return res.status(403).json({
        error: "Course not found or unauthorized",
      });
    }

    if (!course.creatorId) {
      course.creatorId = adminId;
    }

    const { title, description, price } = req.body;

    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          error: "Price must be valid",
        });
      }
      course.price = numericPrice;
    }

    // ✅ Image handling
    if (req.files && req.files.image) {
      const image = req.files.image;

      if (course.image?.public_id) {
        await cloudinary.uploader.destroy(course.image.public_id);
      }

      const cloud = await cloudinary.uploader.upload(
        image.tempFilePath
      );

      course.image = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
      };
    }

    if (title) course.title = title;
    if (description) course.description = description;

    await course.save();

    res.json({
      message: "Course updated successfully",
      course,
    });

  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({
      error: "Error updating course",
    });
  }
};

/* ---------------- DELETE COURSE ---------------- */

export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;

  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.image && course.image.public_id) {
      await cloudinary.uploader.destroy(course.image.public_id);
    }

    res.json({
      message: "Course deleted successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting course" });
  }
};

/* ---------------- GET ALL COURSES ---------------- */

export const getCourses = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    let query = {};

    // 🔍 Search by title
    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    // 📂 Filter by category (only if you have category field)
    if (category) {
      query.category = category;
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    console.log("FINAL QUERY:", query); // 🔥 debug

    const courses = await Course.find(query);

    res.json({
      courses,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching courses" });
  }
};

/* ---------------- GET COURSE DETAILS ---------------- */

export const courseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching course details" });
  }
};

/* ---------------- BUY COURSE ---------------- */

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ errors: "User has already purchased this course" });
    }

    // stripe payment code goes here!!
    // Stripe expects amount in the smallest currency unit (cents for USD)
    const amount = Math.round(course.price * 100);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ errors: "Invalid course price" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(201).json({
      message: "Course purchased successfully",
      course,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ errors: "Error in course buying" });
    console.log("error in course buying ", error);
  }
};
