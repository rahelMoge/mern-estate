import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from "../models/user.model.js";
import Listing from '../models/listing.model.js';


export const test = (req, res) => {
  res.json({
    message: 'API route is working noww',
  });
};
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) return next(errorHandler(401, "you can only update your own account"))
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10)
    }

    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/").replace("api/", "/");
      req.body.avatar = filePath;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(req.body.username && { username: req.body.username }),
          ...(req.body.email && { email: req.body.email }),
          ...(req.body.password && { password: req.body.password }),
          ...(req.body.avatar && { avatar: req.body.avatar }),
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'User has been deleted!' });
  } catch (error) {
    next(error);
  }
}


export const getUserListings = async (req, res, next) => {
  try {
    // Only allow the logged-in user to fetch their own listings
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only view your own listings!'));
    }

    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json({ success: true, listings });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
}

