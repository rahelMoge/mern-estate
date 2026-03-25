import express from "express";
import { upload } from "../utils/multer.js";
import User from "../models/user.model.js";
import { test, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

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
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ profileImage: user.avatar });
  } catch (err) {
    next(err);
  }
});

// Get full user (no password)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    next(err);
  }
});

// Update user (POST method, with optional avatar)
router.post("/update/:id", verifyToken, upload.single("avatar"), updateUser);

export default router;
