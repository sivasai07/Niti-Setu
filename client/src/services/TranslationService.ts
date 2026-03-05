/**
 * TranslationService - Handles text translation between languages
 * Modular design allows easy integration with external translation APIs
 * Currently uses a dictionary-based approach with fallback support
 */

export interface TranslationProvider {
  translate(text: string, fromLang: string, toLang: string): Promise<string>;
  isAvailable(): boolean;
}

/**
 * Dictionary-based translation provider (fallback/offline mode)
 */
class DictionaryTranslationProvider implements TranslationProvider {
  private translations: Record<string, Record<string, string>> = {
    // Form field translations
    'state': {
      'hi': 'राज्य',
      'te': 'రాష్ట్రం',
      'ta': 'மாநிலம்',
      'kn': 'ರಾಜ್ಯ',
      'ml': 'സംസ്ഥാനം',
      'bn': 'রাজ্য',
      'gu': 'રાજ્ય',
      'pa': 'ਰਾਜ',
      'mr': 'राज्य',
    },
    'district': {
      'hi': 'जिला',
      'te': 'జిల్లా',
      'ta': 'மாவட்டம்',
      'kn': 'ಜಿಲ್ಲೆ',
      'ml': 'ജില്ല',
      'bn': 'জেলা',
      'gu': 'જિલ્લો',
      'pa': 'ਜ਼ਿਲ੍ਹਾ',
      'mr': 'जिल्हा',
    },
    'land size': {
      'hi': 'भूमि का आकार',
      'te': 'భూమి పరిమాణం',
      'ta': 'நில அளவு',
      'kn': 'ಭೂಮಿ ಗಾತ್ರ',
      'ml': 'ഭൂമി വലുപ്പം',
      'bn': 'জমির আকার',
      'gu': 'જમીનનું કદ',
      'pa': 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ',
      'mr': 'जमीन आकार',
    },
    'crop type': {
      'hi': 'फसल का प्रकार',
      'te': 'పంట రకం',
      'ta': 'பயிர் வகை',
      'kn': 'ಬೆಳೆ ಪ್ರಕಾರ',
      'ml': 'വിള തരം',
      'bn': 'ফসলের ধরন',
      'gu': 'પાકનો પ્રકાર',
      'pa': 'ਫਸਲ ਦੀ ਕਿਸਮ',
      'mr': 'पीक प्रकार',
    },
    'category': {
      'hi': 'श्रेणी',
      'te': 'వర్గం',
      'ta': 'வகை',
      'kn': 'ವರ್ಗ',
      'ml': 'വിഭാഗം',
      'bn': 'শ্রেণী',
      'gu': 'શ્રેણી',
      'pa': 'ਸ਼੍ਰੇਣੀ',
      'mr': 'श्रेणी',
    },
    'annual income': {
      'hi': 'वार्षिक आय',
      'te': 'వార్షిక ఆదాయం',
      'ta': 'ஆண்டு வருமானம்',
      'kn': 'ವಾರ್ಷಿಕ ಆದಾಯ',
      'ml': 'വാർഷിക വരുമാനം',
      'bn': 'বার্ষিক আয়',
      'gu': 'વાર્ષિક આવક',
      'pa': 'ਸਾਲਾਨਾ ਆਮਦਨ',
      'mr': 'वार्षिक उत्पन्न',
    },
    'income tax payer': {
      'hi': 'आयकर दाता',
      'te': 'ఆదాయపు పన్ను చెల్లింపుదారు',
      'ta': 'வருமான வரி செலுத்துபவர்',
      'kn': 'ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರ',
      'ml': 'ആദായനികുതി അടയ്ക്കുന്നയാൾ',
      'bn': 'আয়কর প্রদানকারী',
      'gu': 'આવકવેરા ચૂકવનાર',
      'pa': 'ਆਮਦਨ ਟੈਕਸ ਦੇਣ ਵਾਲਾ',
      'mr': 'आयकर भरणारा',
    },
    'pension': {
      'hi': 'पेंशन',
      'te': 'పెన్షన్',
      'ta': 'ஓய்வூதியம்',
      'kn': 'ಪಿಂಚಣಿ',
      'ml': 'പെൻഷൻ',
      'bn': 'পেনশন',
      'gu': 'પેન્શન',
      'pa': 'ਪੈਨਸ਼ਨ',
      'mr': 'निवृत्तीवेतन',
    },
    'electricity connection': {
      'hi': 'बिजली कनेक्शन',
      'te': 'విద్యుత్ కనెక్షన్',
      'ta': 'மின்சார இணைப்பு',
      'kn': 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ',
      'ml': 'വൈദ്യുതി കണക്ഷൻ',
      'bn': 'বিদ্যুৎ সংযোগ',
      'gu': 'વીજળી કનેક્શન',
      'pa': 'ਬਿਜਲੀ ਕਨੈਕਸ਼ਨ',
      'mr': 'वीज जोडणी',
    },
    'yes': {
      'hi': 'हाँ',
      'te': 'అవును',
      'ta': 'ஆம்',
      'kn': 'ಹೌದು',
      'ml': 'അതെ',
      'bn': 'হ্যাঁ',
      'gu': 'હા',
      'pa': 'ਹਾਂ',
      'mr': 'होय',
    },
    'no': {
      'hi': 'नहीं',
      'te': 'కాదు',
      'ta': 'இல்லை',
      'kn': 'ಇಲ್ಲ',
      'ml': 'ഇല്ല',
      'bn': 'না',
      'gu': 'ના',
      'pa': 'ਨਹੀਂ',
      'mr': 'नाही',
    },
    'eligible': {
      'hi': 'पात्र',
      'te': 'అర్హత',
      'ta': 'தகுதியுடையவர்',
      'kn': 'ಅರ್ಹ',
      'ml': 'യോഗ്യത',
      'bn': 'যোগ্য',
      'gu': 'પાત્ર',
      'pa': 'ਯੋਗ',
      'mr': 'पात्र',
    },
    'not eligible': {
      'hi': 'अपात्र',
      'te': 'అర్హత లేదు',
      'ta': 'தகுதியற்றவர்',
      'kn': 'ಅರ್ಹವಲ್ಲ',
      'ml': 'യോഗ്യതയില്ല',
      'bn': 'অযোগ্য',
      'gu': 'અપાત્ર',
      'pa': 'ਅਯੋਗ',
      'mr': 'अपात्र',
    },
  };

  public async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    // If same language, return as is
    if (fromLang === toLang) {
      return text;
    }

    // If translating to English, return as is (assuming input is already English)
    if (toLang === 'en') {
      return text;
    }

    // Look up in dictionary
    const lowerText = text.toLowerCase().trim();
    if (this.translations[lowerText] && this.translations[lowerText][toLang]) {
      return this.translations[lowerText][toLang];
    }

    // If not found, return original text
    console.warn(`Translation not found for "${text}" from ${fromLang} to ${toLang}`);
    return text;
  }

  public isAvailable(): boolean {
    return true; // Dictionary is always available
  }
}

/**
 * Google Translate API provider (for production use)
 * Requires API key and backend proxy to avoid CORS issues
 */
class GoogleTranslateProvider implements TranslationProvider {
  private apiKey: string | null = null;
  private apiEndpoint: string = '/api/translate'; // Backend proxy endpoint

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  public async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Google Translate API not configured');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          fromLang,
          toLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  public isAvailable(): boolean {
    // Check if API endpoint is configured
    // In production, this would check if backend proxy is available
    return false; // Disabled by default, enable when backend is ready
  }
}

/**
 * Main Translation Service
 */
export class TranslationService {
  private providers: TranslationProvider[] = [];
  private currentProvider: TranslationProvider;

  constructor() {
    // Initialize providers in order of preference
    const googleProvider = new GoogleTranslateProvider();
    const dictionaryProvider = new DictionaryTranslationProvider();

    this.providers = [googleProvider, dictionaryProvider];

    // Select first available provider
    this.currentProvider = this.providers.find(p => p.isAvailable()) || dictionaryProvider;
    
    console.log('TranslationService initialized with provider:', this.currentProvider.constructor.name);
  }

  /**
   * Translate text from one language to another
   */
  public async translateText(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    if (!text || !text.trim()) {
      return text;
    }

    // If same language, return as is
    if (fromLang === toLang) {
      return text;
    }

    try {
      const translated = await this.currentProvider.translate(text, fromLang, toLang);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Try fallback provider
      const fallbackProvider = this.providers.find(
        p => p !== this.currentProvider && p.isAvailable()
      );

      if (fallbackProvider) {
        try {
          console.log('Trying fallback provider:', fallbackProvider.constructor.name);
          return await fallbackProvider.translate(text, fromLang, toLang);
        } catch (fallbackError) {
          console.error('Fallback translation error:', fallbackError);
        }
      }

      // If all fails, return original text
      return text;
    }
  }

  /**
   * Translate multiple texts at once
   */
  public async translateBatch(
    texts: string[],
    fromLang: string,
    toLang: string
  ): Promise<string[]> {
    const promises = texts.map(text => this.translateText(text, fromLang, toLang));
    return Promise.all(promises);
  }

  /**
   * Translate an object's values
   */
  public async translateObject<T extends Record<string, any>>(
    obj: T,
    fromLang: string,
    toLang: string,
    fieldsToTranslate: (keyof T)[]
  ): Promise<T> {
    const translated = { ...obj };

    for (const field of fieldsToTranslate) {
      if (typeof obj[field] === 'string') {
        translated[field] = await this.translateText(obj[field] as string, fromLang, toLang);
      }
    }

    return translated;
  }

  /**
   * Check if translation is available
   */
  public isAvailable(): boolean {
    return this.currentProvider.isAvailable();
  }

  /**
   * Get current provider name
   */
  public getCurrentProvider(): string {
    return this.currentProvider.constructor.name;
  }
}

// Export singleton instance
export const translationService = new TranslationService();
