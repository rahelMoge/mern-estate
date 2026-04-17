import Message from '../models/message.model.js';
import { errorHandler } from '../utils/error.js';

export const createMessage = async (req, res, next) => {
  try {
    const {
      listingId,
      listingName,
      senderId,
      senderName,
      senderEmail,
      recipientId,
      recipientName,
      recipientEmail,
      subject,
      message,
    } = req.body;

    // Validate required fields
    if (!listingId || !senderId || !recipientId || !subject || !message) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const newMessage = new Message({
      listingId,
      listingName,
      senderId,
      senderName,
      senderEmail,
      recipientId,
      recipientName,
      recipientEmail,
      subject,
      message,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// Get messages received by a user
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ recipientId: req.params.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
