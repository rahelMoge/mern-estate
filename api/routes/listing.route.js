import express from "express";
import listingController from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Create a new listing (supports up to 6 images via imageUrls field)
router.post("/create", verifyToken, listingController.upload.array("imageUrls", 6), listingController.createListing);

// Get a single listing
router.get("/get/:id", listingController.getListing);

// Update a listing
router.post("/update/:id", verifyToken, listingController.upload.array("imageUrls", 6), listingController.updateListing);

// Delete a listing
router.delete("/delete/:id", verifyToken, listingController.deleteListing);

// Get listings for a user
router.get("/user/:id", verifyToken, listingController.getUserListings);

export default router;
