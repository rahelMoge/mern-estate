import express from 'express';
import { createMessage, getMessages } from '../controllers/message.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Send a message (must be logged in)
router.post('/send', verifyToken, createMessage);

// Get messages for a user (must be logged in)
router.get('/:userId', verifyToken, getMessages);

export default router;
