import express from 'express';
import { getAdminStats, getRecentActivity, getSystemStatus, getAllUsers, updateUser, deleteUser, getAllHistory } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes - all protected
router.get('/stats', protect, getAdminStats);
router.get('/recent-activity', protect, getRecentActivity);
router.get('/system-status', protect, getSystemStatus);
router.get('/users', protect, getAllUsers);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);
router.get('/all-history', protect, getAllHistory);

export default router;
