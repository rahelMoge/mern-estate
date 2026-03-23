import express from "express";
import { upload } from "../utils/multer.js";
import File from "../models/File.model.js";

const router = express.Router();

// Upload multiple files
router.post("/", upload.array("files", 10), async (req, res, next) => {
  try {
    console.log("FILES:", req.files); // ✅ debug

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filesData = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const savedFiles = await File.insertMany(filesData);

    res.status(201).json({
      success: true,
      files: savedFiles,
    });
  } catch (err) {
    next(err);
  }
});

// Get all uploaded files
router.get("/", async (req, res, next) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    next(err);
  }
});

export default router;
