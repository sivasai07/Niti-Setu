/**
 * Groq Controller - Handles Groq API requests
 */

import { parseTranscriptWithGroq, translateWithGroq } from '../services/groq.service.js';

/**
 * Parse voice transcript using Groq
 * POST /api/groq/parse
 */
export async function parseTranscript(req, res) {
  try {
    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: 'Transcript is required',
      });
    }

    const parsedData = await parseTranscriptWithGroq(transcript, language || 'en');

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Parse transcript error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse transcript',
    });
  }
}

/**
 * Translate text using Groq
 * POST /api/groq/translate
 */
export async function translateText(req, res) {
  try {
    const { text, fromLang, toLang } = req.body;

    if (!text || !fromLang || !toLang) {
      return res.status(400).json({
        success: false,
        message: 'text, fromLang, and toLang are required',
      });
    }

    const translatedText = await translateWithGroq(text, fromLang, toLang);

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        fromLang,
        toLang,
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to translate text',
    });
  }
}
