/**
 * Services Index - Central export for all services
 * Provides clean imports for multilingual voice eligibility system
 */

export { VoiceService, voiceService } from './VoiceService';
export type { VoiceRecognitionConfig, VoiceRecognitionResult } from './VoiceService';

export { LanguageService, languageService } from './LanguageService';
export type { LanguageConfig } from './LanguageService';

export { TranslationService, translationService } from './TranslationService';
export type { TranslationProvider } from './TranslationService';

export { SpeechService, speechService } from './SpeechService';
export type { SpeechConfig } from './SpeechService';

export { NLPParserService, nlpParserService } from './NLPParserService';
export type { ParsedFormData } from './NLPParserService';

export { EligibilityService, eligibilityService } from './EligibilityService';
export type { EligibilityFormData, EligibilityResponse } from './EligibilityService';
