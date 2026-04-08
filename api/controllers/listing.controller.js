import Listing from "../models/listing.model.js";

// Controller object
const listingController = {
    // Create a new listing
    createListing: async (req, res, next) => {
        try {
            const listing = await Listing.create(req.body);
            return res.status(201).json(listing);
        } catch (error) {
            next(error);
        }
    },

    // Get listings for a specific user
    getUserListings: async (req, res, next) => {
        try {
            const listings = await Listing.find({ userRef: req.params.id });
            return res.status(200).json(listings);
        } catch (error) {
            next(error);
        }
    },

    // Optionally, get all listings
    getAllListings: async (req, res, next) => {
        try {
            const listings = await Listing.find();
            return res.status(200).json(listings);
        } catch (error) {
            next(error);
        }
    }
};

export default listingController;
