import express from 'express';
import multer from 'multer';
import path from 'path';
import { submitFeedback, getAllFeedbacks, convertFeedbackToStory } from '../controllers/feedback.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/feedback/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'feedback-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /webm|mp4|mp3|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'));
    }
  },
});

// Routes
router.post('/', protect, upload.single('feedback'), submitFeedback);
router.get('/', protect, getAllFeedbacks);
router.post('/:id/convert-to-story', protect, convertFeedbackToStory);

export default router;
