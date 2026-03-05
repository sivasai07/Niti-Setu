import express from 'express';
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faq.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllFAQs);

// Protected routes (Admin only)
router.post('/', protect, createFAQ);
router.put('/:id', protect, updateFAQ);
router.delete('/:id', protect, deleteFAQ);

export default router;
