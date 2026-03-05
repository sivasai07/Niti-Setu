/**
 * SpeechService - Handles text-to-speech output using Web Speech API
 * Supports multilingual speech synthesis with voice selection and fallback
 */

export interface SpeechConfig {
  language: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initializeSynthesis();
  }

  /**
   * Initialize speech synthesis with browser compatibility check
   */
  private initializeSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;

      // Load available voices
      this.loadVoices();

      // Voices may load asynchronously
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    } else {
      console.warn('Speech Synthesis API not supported in this browser');
      this.isSupported = false;
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (this.synthesis) {
      this.availableVoices = this.synthesis.getVoices();
      console.log('Available voices loaded:', this.availableVoices.length);
    }
  }

  /**
   * Get best voice for language
   */
  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }

    // Map language codes to voice language codes
    const voiceLangMap: Record<string, string[]> = {
      'en': ['en-US', 'en-GB', 'en-IN', 'en'],
      'hi': ['hi-IN', 'hi'],
      'te': ['te-IN', 'te'],
      'ta': ['ta-IN', 'ta'],
      'kn': ['kn-IN', 'kn'],
      'ml': ['ml-IN', 'ml'],
      'bn': ['bn-IN', 'bn-BD', 'bn'],
      'gu': ['gu-IN', 'gu'],
      'pa': ['pa-IN', 'pa'],
      'mr': ['mr-IN', 'mr'],
    };

    const targetLangs = voiceLangMap[language] || [language];

    // Try to find exact match
    for (const targetLang of targetLangs) {
      const voice = this.availableVoices.find(v => v.lang === targetLang);
      if (voice) {
        console.log('Found exact voice match:', voice.name, voice.lang);
        return voice;
      }
    }

    // Try to find partial match (e.g., 'en' matches 'en-US')
    for (const targetLang of targetLangs) {
      const voice = this.availableVoices.find(v => v.lang.startsWith(targetLang));
      if (voice) {
        console.log('Found partial voice match:', voice.name, voice.lang);
        return voice;
      }
    }

    // Fallback to default voice
    console.warn('No voice found for language:', language, '- using default');
    return this.availableVoices[0] || null;
  }

  /**
   * Check if speech synthesis is supported
   */
  public isSynthesisSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Speak text in specified language
   */
  public speak(text: string, config: SpeechConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      // Stop any ongoing speech
      this.stop();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Set voice
      const voice = this.getVoiceForLanguage(config.language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Fallback to language code
        utterance.lang = this.getVoiceLangCode(config.language);
      }

      // Set speech parameters
      utterance.rate = config.rate ?? 1.0;
      utterance.pitch = config.pitch ?? 1.0;
      utterance.volume = config.volume ?? 1.0;

      // Set event handlers
      utterance.onend = () => {
        console.log('Speech finished');
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Speak
      try {
        this.synthesis.speak(utterance);
        console.log('Speaking:', text.substring(0, 50), '... in', config.language);
      } catch (error: any) {
        console.error('Failed to speak:', error);
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  /**
   * Speak text in multiple languages sequentially
   */
  public async speakMultilingual(
    texts: Array<{ text: string; language: string }>,
    config?: Partial<SpeechConfig>
  ): Promise<void> {
    for (const { text, language } of texts) {
      await this.speak(text, {
        language,
        rate: config?.rate,
        pitch: config?.pitch,
        volume: config?.volume,
      });
    }
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Check if speech is paused
   */
  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  /**
   * Get voice language code from ISO code
   */
  private getVoiceLangCode(langCode: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN',
      'mr': 'mr-IN',
    };

    return languageMap[langCode] || 'en-US';
  }

  /**
   * Get list of available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    return this.availableVoices;
  }

  /**
   * Get voices for specific language
   */
  public getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    const voiceLangCode = this.getVoiceLangCode(language);
    return voices.filter(v => v.lang.startsWith(voiceLangCode.split('-')[0]));
  }
}

// Export singleton instance
export const speechService = new SpeechService();
