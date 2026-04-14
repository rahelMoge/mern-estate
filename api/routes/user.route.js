import express from "express";
import { upload } from "../utils/multer.js";
import User from "../models/user.model.js";
import { deleteUser, test, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import listingController from "../controllers/listing.controller.js"; // default export

const router = express.Router();

// Test route
router.get("/test", test);

// Delete user
router.delete("/delete/:id", verifyToken, deleteUser);

// Upload profile image
router.post("/uploadProfile", upload.single("profileImage"), async (req, res, next) => {
  try {
    const userId = req.body.userId; // frontend sends userId
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

// Get full user (without password)
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

// Update user (with optional avatar)
router.post("/update/:id", verifyToken, upload.single("avatar"), updateUser);

// Get listings for a user
router.get('/listings/:id', verifyToken, listingController.getUserListings);


export default router;
