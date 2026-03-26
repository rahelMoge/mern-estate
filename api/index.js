import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

// Set DNS resolution order to prefer IPv4 (fixes Atlas connection issue in Node 17+)
dns.setDefaultResultOrder("ipv4first");

// Disable mongoose command buffering so DB ops fail fast when not connected
mongoose.set("bufferCommands", false);

import uploadRouter from "./routes/upload.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "api/uploads")));


// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

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
    console.error("❌ MONGO_URI is not defined in environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
