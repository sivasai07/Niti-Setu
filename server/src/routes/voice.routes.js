import express from 'express';
import { processVoiceInput } from '../controllers/voice.controller.js';

const router = express.Router();

router.post('/process', processVoiceInput);

export default router;
