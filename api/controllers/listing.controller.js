import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Multer configuration for listing images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "api/uploads/listings/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

export const upload = multer({ storage });

export const createListing = async (req, res, next) => {
    try {
        let imageUrls = req.body.imageUrls;

        // Handle images sent via multer
        if (req.files && req.files.length > 0) {
            const uploadedUrls = req.files.map(file => {
                return file.path.replace(/\\/g, "/").replace("api/", "/");
            });
            // If imageUrls is a string (single URL), convert to array
            if (typeof imageUrls === 'string') imageUrls = [imageUrls];
            if (!Array.isArray(imageUrls)) imageUrls = [];

            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        const listing = await Listing.create({
            ...req.body,
            imageUrls,
            userRef: req.user.id, // Ensure userRef comes from authenticated user
        });
        return res.status(201).json(listing);
    } catch (error) {
        next(error);
    }
};

export const getUserListings = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            return next(errorHandler(401, "You can only view your own listings!"));
        }

        const listings = await Listing.find({ userRef: req.params.id });
        res.status(200).json({ success: true, listings });
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return next(errorHandler(404, "Listing not found!"));
    }
    if (req.user.id !== listing.userRef) {
        return next(errorHandler(401, "You can only delete your own listings!"));
    }
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Listing has been deleted!" });
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return next(errorHandler(404, "Listing not found!"));
    }
    if (req.user.id !== listing.userRef) {
        return next(errorHandler(401, "You can only update your own listings!"));
    }
    try {
        let imageUrls = req.body.imageUrls || listing.imageUrls;

        if (req.files && req.files.length > 0) {
            const uploadedUrls = req.files.map(file => {
                return file.path.replace(/\\/g, "/").replace("api/", "/");
            });
            if (typeof imageUrls === 'string') imageUrls = [imageUrls];
            if (!Array.isArray(imageUrls)) imageUrls = [];

            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            { ...req.body, imageUrls },
            { new: true }
        );
        res.status(200).json(updatedListing);
    } catch (error) {
        next(error);
    }
};

export const getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return next(errorHandler(404, "Listing not found!"));
        }
        res.status(200).json(listing);
    } catch (error) {
        next(error);
    }
};

export const getListings = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;
        let offer = req.query.offer;
        if (offer === undefined || offer === 'false') {
            offer = { $in: [false, true] }

        }

        let furnished = req.query.furnished;
        if (furnished === undefined || furnished === 'false') {
            furnished = { $in: [false, true] }
        }

        let parking = req.query.parking;
        if (parking === undefined || parking === 'false')
            parking = { $in: [false, true] }

        let type = req.query.type;
        if (type === undefined || type === 'all')
            type = { $in: ['sale', 'rent'] };

        const searchTerm = req.query.searchTerm || '';

        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';
        const listings = await Listing.find({
            name: { $regex: searchTerm, $options: 'i' },
            offer,
            furnished,
            parking,
            type,
        }).sort(
            { [sort]: order }
        ).limit(limit).skip(startIndex);

        return res.status(200).json(listings);


    } catch (error) {
        next(error);
    }
};


// Default export as an object for route usage
const listingController = {
    createListing,
    getUserListings,
    deleteListing,
    updateListing,
    getListing,
    upload,
    getListings,
};

export default listingController;