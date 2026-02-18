import express from 'express';
import { getUserHistory, addHistoryEntry, deleteHistoryEntry } from '../controllers/history.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes
router.get('/', protect, getUserHistory);
router.post('/', protect, addHistoryEntry);
router.delete('/:id', protect, deleteHistoryEntry);

export default router;
