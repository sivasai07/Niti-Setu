/**
 * VoiceService - Handles speech recognition using Web Speech API
 * Supports multilingual voice input with automatic language detection
 */

export interface VoiceRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  language?: string;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  detectedLanguage?: string;
}

export class VoiceService {
  private recognition: any = null;
  private isSupported: boolean = false;
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.initializeRecognition();
  }

  /**
   * Initialize speech recognition with browser compatibility check
   */
  private initializeRecognition(): void {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      this.setupEventHandlers();
    } else {
      console.warn('Speech Recognition API not supported in this browser');
      this.isSupported = false;
    }
  }

  /**
   * Setup event handlers for speech recognition
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        // Try to detect language from the transcript
        const detectedLanguage = this.detectLanguageFromTranscript(transcript);

        if (this.onResultCallback) {
          this.onResultCallback({
            transcript,
            confidence,
            isFinal,
            detectedLanguage,
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      const errorMessage = this.getErrorMessage(event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    this.recognition.onend = () => {
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * Detect language from transcript using character patterns
   * This is a basic heuristic - for production, use a proper language detection API
   */
  private detectLanguageFromTranscript(transcript: string): string {
    // Hindi/Devanagari script
    if (/[\u0900-\u097F]/.test(transcript)) return 'hi';
    
    // Telugu script
    if (/[\u0C00-\u0C7F]/.test(transcript)) return 'te';
    
    // Tamil script
    if (/[\u0B80-\u0BFF]/.test(transcript)) return 'ta';
    
    // Kannada script
    if (/[\u0C80-\u0CFF]/.test(transcript)) return 'kn';
    
    // Malayalam script
    if (/[\u0D00-\u0D7F]/.test(transcript)) return 'ml';
    
    // Bengali script
    if (/[\u0980-\u09FF]/.test(transcript)) return 'bn';
    
    // Gujarati script
    if (/[\u0A80-\u0AFF]/.test(transcript)) return 'gu';
    
    // Punjabi script
    if (/[\u0A00-\u0A7F]/.test(transcript)) return 'pa';
    
    // Marathi (uses Devanagari, same as Hindi)
    // Would need context or additional detection
    
    // Default to English if no script detected
    return 'en';
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not accessible. Please check permissions.',
      'not-allowed': 'Microphone permission denied. Please allow microphone access.',
      'network': 'Network error. Please check your connection.',
      'aborted': 'Speech recognition aborted.',
      'service-not-allowed': 'Speech recognition service not allowed.',
    };

    return errorMessages[error] || `Speech recognition error: ${error}`;
  }

  /**
   * Check if speech recognition is supported
   */
  public isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Start speech recognition
   */
  public startRecognition(config: VoiceRecognitionConfig = {}): void {
    if (!this.isSupported || !this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition not supported in this browser');
      }
      return;
    }

    // Configure recognition
    this.recognition.continuous = config.continuous ?? false;
    this.recognition.interimResults = config.interimResults ?? false;
    this.recognition.maxAlternatives = config.maxAlternatives ?? 1;
    
    // Set language if provided, otherwise use auto-detect
    if (config.language) {
      this.recognition.lang = this.getSpeechRecognitionLanguageCode(config.language);
    } else {
      // Default to English, but will auto-detect from transcript
      this.recognition.lang = 'en-US';
    }

    try {
      this.recognition.start();
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
    }
  }

  /**
   * Stop speech recognition
   */
  public stopRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  }

  /**
   * Abort speech recognition
   */
  public abortRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (error) {
        console.error('Failed to abort recognition:', error);
      }
    }
  }

  /**
   * Set callback for recognition results
   */
  public onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for recognition end
   */
  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Get speech recognition language code from ISO code
   */
  private getSpeechRecognitionLanguageCode(langCode: string): string {
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
   * Clean up resources
   */
  public destroy(): void {
    this.stopRecognition();
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
