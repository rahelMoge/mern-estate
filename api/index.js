import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

dotenv.config();

// Set DNS resolution order to prefer IPv4 (fixes Atlas connection issue in Node 17+)
dns.setDefaultResultOrder('ipv4first');

// Disable mongoose command buffering so DB ops fail fast when not connected
mongoose.set('bufferCommands', false);

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start server only after successful MongoDB connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      // Note: `useNewUrlParser` and `useUnifiedTopology` are no longer
      // accepted by the current MongoDB driver; remove them to avoid errors.
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
