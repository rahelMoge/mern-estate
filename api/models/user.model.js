import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw...", // shortened for clarity
    },
  },
  { timestamps: true }
);

// Fix OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
