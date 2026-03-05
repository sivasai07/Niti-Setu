import express from 'express';
import { parseTranscript, translateText } from '../controllers/groq.controller.js';

const router = express.Router();

router.post('/parse', parseTranscript);
router.post('/translate', translateText);

export default router;
