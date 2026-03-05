/**
 * LanguageService - Manages language detection and active language state
 * Handles user preferred language and session-based language overrides
 */

export interface LanguageConfig {
  preferredLanguage: string;
  activeLanguage: string;
  detectedLanguage?: string;
}

export class LanguageService {
  private preferredLanguage: string = 'en';
  private activeLanguage: string = 'en';
  private detectedLanguage: string | null = null;

  /**
   * Initialize language service with user's preferred language
   */
  public initialize(preferredLanguage: string = 'en'): void {
    this.preferredLanguage = preferredLanguage;
    this.activeLanguage = preferredLanguage;
    console.log('LanguageService initialized with preferred language:', preferredLanguage);
  }

  /**
   * Get preferred language from user profile
   */
  public getPreferredLanguage(): string {
    return this.preferredLanguage;
  }

  /**
   * Set preferred language (from user profile)
   */
  public setPreferredLanguage(language: string): void {
    this.preferredLanguage = language;
    // If no language has been detected yet, update active language
    if (!this.detectedLanguage) {
      this.activeLanguage = language;
    }
    console.log('Preferred language set to:', language);
  }

  /**
   * Get active language for current session
   */
  public getActiveLanguage(): string {
    return this.activeLanguage;
  }

  /**
   * Set detected language from voice input
   * This overrides preferred language for the current session
   */
  public setDetectedLanguage(language: string): void {
    if (this.isSupportedLanguage(language)) {
      this.detectedLanguage = language;
      this.activeLanguage = language;
      console.log('Detected language set to:', language, '(overriding preferred language)');
    } else {
      console.warn('Unsupported language detected:', language, '- falling back to preferred language');
      this.activeLanguage = this.preferredLanguage;
    }
  }

  /**
   * Reset to preferred language (clear detected language override)
   */
  public resetToPreferredLanguage(): void {
    this.detectedLanguage = null;
    this.activeLanguage = this.preferredLanguage;
    console.log('Reset to preferred language:', this.preferredLanguage);
  }

  /**
   * Check if a language is supported
   */
  public isSupportedLanguage(language: string): boolean {
    const supportedLanguages = [
      'en', // English
      'hi', // Hindi
      'te', // Telugu
      'ta', // Tamil
      'kn', // Kannada
      'ml', // Malayalam
      'bn', // Bengali
      'gu', // Gujarati
      'pa', // Punjabi
      'mr', // Marathi
      'or', // Odia
    ];

    return supportedLanguages.includes(language);
  }

  /**
   * Get list of supported languages
   */
  public getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    ];
  }

  /**
   * Get language name from code
   */
  public getLanguageName(code: string): string {
    const language = this.getSupportedLanguages().find(lang => lang.code === code);
    return language ? language.name : code;
  }

  /**
   * Get native language name from code
   */
  public getNativeLanguageName(code: string): string {
    const language = this.getSupportedLanguages().find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }

  /**
   * Get current language configuration
   */
  public getLanguageConfig(): LanguageConfig {
    return {
      preferredLanguage: this.preferredLanguage,
      activeLanguage: this.activeLanguage,
      detectedLanguage: this.detectedLanguage || undefined,
    };
  }

  /**
   * Check if active language is different from preferred
   */
  public isLanguageOverridden(): boolean {
    return this.detectedLanguage !== null && this.activeLanguage !== this.preferredLanguage;
  }
}

// Export singleton instance
export const languageService = new LanguageService();
