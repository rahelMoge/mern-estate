import mongoose from 'mongoose'; // Import mongoose to work with MongoDB

const userSchema = new mongoose.Schema(
{
  username: {
    type: String, // Username must be text
    required: true, // Field is required
    unique: true, // Username must be unique
  },

  email: {
    type: String, // Email must be text
    required: true, // Email is required
  },

  password: {
    type: String, // Password will be stored as hashed string
    required: true, // Password is required
  }, // ← comma was missing here

  avatar: {
    type: String, // User profile image URL
    default:
      "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=", // Default avatar if user doesn't upload one
  },
},
{ timestamps: true } // Automatically adds createdAt and updatedAt
);

const User = mongoose.model('User', userSchema); // Create User model from schema

export default User; // Export the model so other files can use it
