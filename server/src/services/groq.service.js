/**
 * Groq NLP Service - Uses Groq API to parse voice transcripts
 * Extracts structured form data from natural language
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Parse transcript using Groq API
 * @param {string} transcript - Voice transcript
 * @param {string} language - Language code (en, hi, te, etc.)
 * @returns {Promise<Object>} Parsed form data
 */
export async function parseTranscriptWithGroq(transcript, language = 'en') {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const systemPrompt = `You are an AI assistant that extracts structured data from farmer voice input for government scheme eligibility checking.

Extract the following fields from the transcript:
- state: Indian state name
- district: District name
- landSize: Land size in acres (number only)
- cropType: Type of crop being grown
- category: Social category (General, OBC, SC, or ST)
- annualIncome: Annual income in rupees (number only)
- incomeTaxPayer: Whether they pay income tax (Yes or No)
- receivingPension: Whether they receive pension (Yes or No)
- electricityConnection: Whether they have electricity connection (Yes or No)

Return ONLY a valid JSON object with these exact field names. If a field is not mentioned, use null.
Do not include any explanation, just the JSON object.

Example output:
{
  "state": "Telangana",
  "district": "Hyderabad",
  "landSize": "5",
  "cropType": "Rice",
  "category": "General",
  "annualIncome": "200000",
  "incomeTaxPayer": "No",
  "receivingPension": "No",
  "electricityConnection": "Yes"
}`;

  const userPrompt = `Extract form data from this transcript (language: ${language}):\n\n${transcript}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Groq response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Groq parsed data:', parsedData);

    return parsedData;
  } catch (error) {
    console.error('Groq parsing error:', error);
    throw error;
  }
}

/**
 * Translate text using Groq API
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code
 * @param {string} toLang - Target language code
 * @returns {Promise<string>} Translated text
 */
export async function translateWithGroq(text, fromLang, toLang) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  if (fromLang === toLang) {
    return text;
  }

  const languageNames = {
    'en': 'English',
    'hi': 'Hindi',
    'te': 'Telugu',
    'ta': 'Tamil',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'pa': 'Punjabi',
    'mr': 'Marathi',
  };

  const fromLanguage = languageNames[fromLang] || fromLang;
  const toLanguage = languageNames[toLang] || toLang;

  const systemPrompt = `You are a professional translator. Translate the given text from ${fromLanguage} to ${toLanguage}. Return ONLY the translated text, nothing else.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation in Groq response');
    }

    return translatedText;
  } catch (error) {
    console.error('Groq translation error:', error);
    throw error;
  }
}
