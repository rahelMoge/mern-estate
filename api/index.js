import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// Allows Express to read JSON from Insomnia/Postman
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

/* =========================
   ROUTES
========================= */

// Test route (optional b
// ... existing code ...

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter); // This defines the start of your URL

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
