import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
} from '../controllers/stories.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllStories);
router.get('/:id', getStoryById);

// Admin routes
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

export default router;
