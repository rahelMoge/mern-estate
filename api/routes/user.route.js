import express from "express";
import { upload } from "../utils/multer.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import path from "path";
import { test } from "../controllers/user.controller.js";

const router = express.Router();

// Test route
router.get("/test", test);

// Upload profile image
router.post("/uploadProfile", upload.single("profileImage"), async (req, res, next) => {
  try {
    const userId = req.body.userId; // pass userId from frontend
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save profile image path in user document
    // store a relative path that the frontend can use with its base backend URL
    const filePath = req.file.path.replace(/\\/g, "/").replace("api/", "/");
    user.avatar = filePath;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    next(err);
  }
});

// Get profile image
router.get("/:userId/profileImage", async (req, res, next) => {
  try {
        console.log("HERE:", req.body); // ✅ debug

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ profileImage: user.avatar });
  } catch (err) {
    next(err);
  }
});

// Get full user (no password)
router.get("/:id", async (req, res, next) => {
        console.log("HERE:", req.body); // ✅ debug

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    next(err);
  }
});

// Update user (username, email, password, avatar)
router.put("/:id", upload.single("avatar"), async (req, res, next) => {
  try {

    console.log("HERE:", req.body); // ✅ debug
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email, password } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = bcrypt.hashSync(password, 10);

    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/").replace("api/", "/");
      user.avatar = filePath;
    }

    await user.save();

    const { password: pass, ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    next(err);
  }
});

export default router;
