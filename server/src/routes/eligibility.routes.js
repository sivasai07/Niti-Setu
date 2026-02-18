import express from 'express';
import { processVoiceInput, checkEligibility } from '../controllers/eligibility.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.post('/process-voice', protect, processVoiceInput);
// router.post('/check', protect, checkEligibility);
router.post("/check", checkEligibility);

export default router;
