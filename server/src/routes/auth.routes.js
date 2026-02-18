import express from 'express';
import {
  register,
  login,
  checkAdminExists,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/check-admin', checkAdminExists);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

export default router;
