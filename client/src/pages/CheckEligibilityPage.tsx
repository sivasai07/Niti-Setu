import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Edit2, CheckCircle, AlertCircle, Loader, Volume2, VolumeX, Languages } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Button } from '../components/ui/Button';
import { states, getDistricts } from '../data/statesDistricts';
import { useLanguage } from '../contexts/LanguageContext';

// Import all services
import {
  voiceService,
  languageService,
  translationService,
  speechService,
  eligibilityService,
} from '../services';
import type { VoiceRecognitionResult, EligibilityFormData } from '../services';

export function CheckEligibilityPage() {
  const { currentLanguage, setLanguage, t, supportedLanguages } = useLanguage();

  // Language state
  const [activeLanguage, setActiveLanguage] = useState(currentLanguage);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    land_size: '',
    crop_type: '',
    category: '',
    annual_income: '',
    income_tax_payer: '',
    pension: '',
    pension_amount: '',
    electricity_connection: '',
  });

  // UI state
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  /**
   * Initialize services and load user preferences
   */
  useEffect(() => {
    // Sync with global language
    setActiveLanguage(currentLanguage);
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Pre-fill user data
      setFormData(prev => ({
        ...prev,
        state: userData.state || '',
        district: userData.district || '',
      }));
    }

    // Check if voice recognition is supported
    if (!voiceService.isRecognitionSupported()) {
      setError('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
    }

    // Check if speech synthesis is supported
    if (!speechService.isSynthesisSupported()) {
      console.warn('Speech synthesis not supported');
    }

    return () => {
      // Cleanup
      voiceService.destroy();
      speechService.stop();
    };
  }, [currentLanguage]);

  /**
   * Update districts when state changes
   */
  useEffect(() => {
    if (formData.state) {
      const districts = getDistricts(formData.state);
      setAvailableDistricts(districts);
      if (formData.district && !districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state, formData.district]);

  /**
   * Handle language change - affects entire app
   */
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage); // Update global language
    languageService.setPreferredLanguage(newLanguage);
    setActiveLanguage(newLanguage);
    console.log('Global language changed to:', newLanguage);
  }, [setLanguage]);

  /**
   * Start voice recording
   */
  const startRecording = useCallback(() => {
    setTranscript('');
    setError('');
    setIsRecording(true);

    // Setup voice service callbacks
    voiceService.onResult((result: VoiceRecognitionResult) => {
      if (result.isFinal) {
        setTranscript(prev => prev + result.transcript + ' ');
        
        // Detect language if available
        if (result.detectedLanguage) {
          setDetectedLanguage(result.detectedLanguage);
          languageService.setDetectedLanguage(result.detectedLanguage);
          setActiveLanguage(result.detectedLanguage);
          console.log('Detected language:', result.detectedLanguage);
        }
      }
    });

    voiceService.onError((errorMsg: string) => {
      setError(errorMsg);
      setIsRecording(false);
    });

    voiceService.onEnd(() => {
      setIsRecording(false);
    });

    // Start recognition
    voiceService.startRecognition({
      continuous: true,
      interimResults: false,
      language: currentLanguage,
    });
  }, [currentLanguage]);

  /**
   * Stop voice recording and process transcript
   */
  const stopRecording = useCallback(async () => {
    voiceService.stopRecognition();
    setIsRecording(false);

    if (!transcript.trim()) {
      setError('No speech detected. Please try again.');
      return;
    }

    // Process the transcript
    await processTranscript(transcript);
  }, [transcript]);

  /**
   * Process transcript and extract form data using Groq API
   */
  const processTranscript = async (text: string) => {
    setIsProcessing(true);
    setError('');

    try {
      // Call backend Groq API to parse transcript
      const response = await fetch('http://localhost:5000/api/groq/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          language: activeLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse transcript');
      }

      const result = await response.json();
      const parsedData = result.data;

      console.log('Groq parsed data:', parsedData);

      // Update form with parsed data
      setFormData(prev => ({
        ...prev,
        state: parsedData.state || prev.state,
        district: parsedData.district || prev.district,
        land_size: parsedData.landSize || prev.land_size,
        crop_type: parsedData.cropType || prev.crop_type,
        category: parsedData.category || prev.category,
        annual_income: parsedData.annualIncome || prev.annual_income,
        income_tax_payer: parsedData.incomeTaxPayer || prev.income_tax_payer,
        pension: parsedData.receivingPension || prev.pension,
        electricity_connection: parsedData.electricityConnection || prev.electricity_connection,
      }));

      // Enable editing mode
      setIsEditing(true);

    } catch (err) {
      console.error('Process transcript error:', err);
      setError('Failed to process speech. Please try again or fill the form manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Check eligibility with translation
   */
  const handleCheckEligibility = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.state || !formData.district || !formData.land_size || 
          !formData.crop_type || !formData.category || !formData.annual_income ||
          !formData.income_tax_payer || !formData.pension || !formData.electricity_connection) {
        setError('Please fill in all required fields');
        setIsProcessing(false);
        return;
      }

      // Validate pension amount if pension is Yes
      if (formData.pension === 'Yes' && !formData.pension_amount) {
        setError('Please enter pension amount');
        setIsProcessing(false);
        return;
      }

      // Prepare eligibility form data
      const eligibilityData: EligibilityFormData = {
        state: formData.state,
        district: formData.district,
        landSize: parseFloat(formData.land_size) || 0,
        cropType: formData.crop_type,
        category: formData.category,
        annualIncome: parseFloat(formData.annual_income) || 0,
        incomeTaxPayer: formData.income_tax_payer === 'Yes',
        receivingPension: formData.pension === 'Yes',
        electricityConnection: formData.electricity_connection === 'Yes',
      };

      console.log('Checking eligibility with data:', eligibilityData);
      console.log('Active language:', activeLanguage);

      // Call eligibility service with retry logic
      const response = await eligibilityService.checkEligibilityWithRetry(
        eligibilityData,
        activeLanguage,
        3 // max retries
      );

      console.log('Eligibility response:', response);
      console.log('Has AIF key:', 'AIF' in response);
      console.log('Has full AIF key:', 'Agriculture Infrastructure Fund (AIF)' in response);
      console.log('AIF data:', response['AIF']);
      console.log('Full AIF data:', response['Agriculture Infrastructure Fund (AIF)']);
      setEligibleSchemes(response);

      // Save to history
      await saveToHistory(formData, response);

      // Speak results in user's language then English
      await speakResults(response);

    } catch (err: any) {
      console.error('Eligibility check error:', err);
      setError(err.message || 'Failed to check eligibility. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Save eligibility check to history
   */
  const saveToHistory = async (inputData: any, outputData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const eligibleSchemes = [];
      if (outputData['PM-KISAN']?.eligible) eligibleSchemes.push('PM-KISAN');
      if (outputData['PM-KUSUM']?.components) {
        const eligibleComponents = Object.entries(outputData['PM-KUSUM'].components)
          .filter(([_, comp]: [string, any]) => comp.eligible)
          .map(([name, _]) => `PM-KUSUM ${name.replace(/_/g, ' ')}`);
        eligibleSchemes.push(...eligibleComponents);
      }
      if (outputData['AIF']?.eligible || outputData['Agriculture Infrastructure Fund (AIF)']?.eligible) {
        eligibleSchemes.push('AIF');
      }

      const title = eligibleSchemes.length > 0 
        ? `Eligible for ${eligibleSchemes.join(', ')}`
        : 'Eligibility Check Completed';

      const description = outputData.best_scheme 
        ? `Best scheme: ${outputData.best_scheme}. ${outputData.summary || ''}`
        : 'Checked eligibility for government schemes';

      const formattedInputData = {
        state: inputData.state,
        district: inputData.district,
        landHolding: inputData.land_size,
        cropType: inputData.crop_type,
        socialCategory: inputData.category,
        annualIncome: inputData.annual_income,
        incomeTaxPayer: inputData.income_tax_payer,
        pension: inputData.pension,
        electricityConnection: inputData.electricity_connection,
      };

      await fetch('http://localhost:5000/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'scheme',
          title,
          description,
          status: 'completed',
          inputData: formattedInputData,
          outputData,
        }),
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  /**
   * Speak results in user's language then English
   */
  const speakResults = async (response: any) => {
    if (!speechService.isSynthesisSupported()) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      setIsSpeaking(true);

      // Prepare result text
      let resultText = '';
      
      if (response.scheme_comparison?.recommended_scheme) {
        // Replace underscores with spaces for better speech
        const schemeName = response.scheme_comparison.recommended_scheme.replace(/_/g, ' ');
        resultText = `Recommended scheme: ${schemeName}. `;
      }

      if (response['PM-KISAN']?.eligible) {
        resultText += `You are eligible for PM KISAN scheme. `;
      }

      if (response['PM-KUSUM']?.eligible) {
        resultText += `You are eligible for PM KUSUM scheme. `;
      }

      if (!resultText) {
        resultText = 'Eligibility check completed. Please review the results.';
      }

      // Speak in user's language first
      if (activeLanguage !== 'en') {
        const translatedText = await translationService.translateText(
          resultText,
          'en',
          activeLanguage
        );
        await speechService.speak(translatedText, {
          language: activeLanguage,
          rate: 0.9,
        });
      }

      // Then speak in English
      await speechService.speak(resultText, {
        language: 'en',
        rate: 0.9,
      });

    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Toggle speech for results
   */
  const handleSpeakResult = async (text: string) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      try {
        setIsSpeaking(true);
        
        // Speak in active language
        await speechService.speak(text, {
          language: activeLanguage,
          rate: 0.9,
        });

        // Then in English if different
        if (activeLanguage !== 'en') {
          await speechService.speak(text, {
            language: 'en',
            rate: 0.9,
          });
        }
      } catch (error) {
        console.error('Speech error:', error);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  /**
   * Get supported languages for selector
   */
  // Already available from useLanguage hook

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4 flex-col">
                <h1 className="text-4xl font-sans font-bold bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                  {t('eligibility.title')}
                </h1>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                  {t('eligibility.subtitle')}
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex justify-center items-center gap-4">
                <Languages className="w-5 h-5 text-saffron" />
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                >
                  {supportedLanguages
                    .filter(lang => ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or'].includes(lang.code))
                    .map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                </select>
                {detectedLanguage && detectedLanguage !== currentLanguage && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    Detected: {languageService.getNativeLanguageName(detectedLanguage)}
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Voice Input Section */}
            {!isEditing && !eligibleSchemes && (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 mb-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">{t('eligibility.step1')}</h2>
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                    {t('eligibility.voice_instruction')}
                  </p>
                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-8 italic">
                    {t('eligibility.input_fields')}
                  </p>

                  <div className="mb-8">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-gradient-to-r from-saffron to-green hover:shadow-2xl'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isRecording ? (
                        <MicOff className="w-16 h-16 text-white" />
                      ) : (
                        <Mic className="w-16 h-16 text-white" />
                      )}
                    </button>
                    <p className="mt-4 text-sm font-medium">
                      {isRecording ? t('eligibility.stop_recording') : t('eligibility.start_recording')}
                    </p>
                  </div>

                  {transcript && (
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4 text-left mb-4">
                      <h3 className="font-semibold mb-2">Transcript:</h3>
                      <p className="text-sm">{transcript}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 text-saffron mb-4">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>{t('eligibility.processing')}</span>
                    </div>
                  )}
                  
                  {/* Skip to Form Button */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t('eligibility.skip_manual')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Section */}
            {isEditing && !eligibleSchemes && (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('eligibility.step2')}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setTranscript('');
                    }}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {t('eligibility.use_voice')}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.state')} *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      required
                    >
                      <option value="">{t('form.select_state')}</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.district')} *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!formData.state}
                      required
                    >
                      <option value="">
                        {formData.state ? t('form.select_district') : 'Select state first'}
                      </option>
                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Land Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.land_size')} *</label>
                    <input
                      type="text"
                      value={formData.land_size}
                      onChange={(e) => setFormData({ ...formData, land_size: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., 5"
                    />
                  </div>

                  {/* Crop Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.crop_type')} *</label>
                    <input
                      type="text"
                      value={formData.crop_type}
                      onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., Rice, Wheat"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.category')} *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{t('form.select_category')}</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.annual_income')} *</label>
                    <input
                      type="text"
                      value={formData.annual_income}
                      onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., 200000"
                    />
                  </div>

                  {/* Income Tax Payer */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.income_tax_payer')} *</label>
                    <select
                      value={formData.income_tax_payer}
                      onChange={(e) => setFormData({ ...formData, income_tax_payer: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{t('form.select')}</option>
                      <option value="Yes">{t('form.yes')}</option>
                      <option value="No">{t('form.no')}</option>
                    </select>
                  </div>

                  {/* Pension */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('form.pension')} *</label>
                    <select
                      value={formData.pension}
                      onChange={(e) => {
                        setFormData({ ...formData, pension: e.target.value, pension_amount: e.target.value === 'No' ? '0' : formData.pension_amount });
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{t('form.select')}</option>
                      <option value="Yes">{t('form.yes')}</option>
                      <option value="No">{t('form.no')}</option>
                    </select>
                  </div>

                  {/* Pension Amount - Conditional */}
                  {formData.pension === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('form.pension_amount')} *</label>
                      <input
                        type="number"
                        value={formData.pension_amount}
                        onChange={(e) => setFormData({ ...formData, pension_amount: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                        placeholder="Enter monthly pension amount"
                        min="0"
                      />
                    </div>
                  )}

                  {formData.pension === 'No' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('form.pension_amount')} *</label>
                      <input
                        type="number"
                        value="0"
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron opacity-50 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Electricity Connection */}
                  <div className={formData.pension ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-medium mb-2">{t('form.electricity')} *</label>
                    <select
                      value={formData.electricity_connection}
                      onChange={(e) => setFormData({ ...formData, electricity_connection: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{t('form.select')}</option>
                      <option value="Yes">{t('form.yes')}</option>
                      <option value="No">{t('form.no')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleCheckEligibility}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        {t('eligibility.checking')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {t('eligibility.check_btn')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Results Section - Simplified */}
            {eligibleSchemes && (
              <div className="space-y-6">
                {/* Recommended Scheme Card */}
                {eligibleSchemes.scheme_comparison && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-2xl shadow-xl border-2 border-saffron/30 dark:border-saffron/50 p-8"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold">🎯 Recommended Scheme</h2>
                        <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                          Best match for your profile
                        </p>
                      </div>
                      {/* Text-to-Speech Button */}
                      <button
                        onClick={() => handleSpeakResult(`Recommended scheme: ${eligibleSchemes.scheme_comparison.recommended_scheme.replace(/_/g, ' ')}`)}
                        className="p-3 rounded-full bg-white dark:bg-dark-background hover:bg-light-muted dark:hover:bg-dark-muted transition-colors border-2 border-saffron"
                        title="Listen to results"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-6 h-6 text-saffron" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-saffron" />
                        )}
                      </button>
                    </div>
                    
                    <div className="bg-white dark:bg-dark-background rounded-xl p-6 mb-4">
                      <p className="text-2xl font-bold text-saffron mb-2">
                        {eligibleSchemes.scheme_comparison.recommended_scheme.replace(/_/g, ' ')}
                      </p>
                      <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground">
                        {eligibleSchemes.scheme_comparison.comparison_note}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">Total Eligible Schemes</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {eligibleSchemes.scheme_comparison.total_eligible_schemes}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Eligible Schemes</p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {eligibleSchemes.scheme_comparison.eligible_schemes.join(', ')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PM-KISAN Scheme Card */}
                {eligibleSchemes['PM-KISAN'] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                      eligibleSchemes['PM-KISAN'].eligible
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-600 hover:border-emerald-600 dark:hover:border-emerald-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          eligibleSchemes['PM-KISAN'].eligible
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {eligibleSchemes['PM-KISAN'].eligible ? (
                            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">PM-KISAN</h2>
                          <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                            Pradhan Mantri Kisan Samman Nidhi
                          </p>
                        </div>
                      </div>
                      {eligibleSchemes['PM-KISAN'].benefit_summary && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-lg">
                          <p className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                            {eligibleSchemes['PM-KISAN'].benefit_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${
                      eligibleSchemes['PM-KISAN'].eligible
                        ? 'border-emerald-200 dark:border-emerald-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <h3 className="font-semibold text-lg mb-2">Eligibility Status</h3>
                      <p className={`text-lg font-semibold mb-2 ${
                        eligibleSchemes['PM-KISAN'].eligible
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {eligibleSchemes['PM-KISAN'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </p>
                      <p className="text-light-foreground dark:text-dark-foreground">
                        {eligibleSchemes['PM-KISAN'].reason_message}
                      </p>
                    </div>

                    {/* Document Proof from API */}
                    {eligibleSchemes['PM-KISAN'].proof && eligibleSchemes['PM-KISAN'].proof.length > 0 && (
                      <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-700">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-emerald-600">📄</span> Document Proof
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['PM-KISAN'].proof.slice(0, 2).map((proofItem: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                                  {proofItem.document_name}
                                </p>
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                                  Page {proofItem.page_number}
                                </span>
                              </div>
                              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                                {proofItem.line_reference}
                              </p>
                              <p className="text-sm text-light-foreground dark:text-dark-foreground italic bg-light-muted dark:bg-dark-muted p-3 rounded">
                                "{proofItem.snippet.substring(0, 300)}..."
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps from API */}
                    {eligibleSchemes['PM-KISAN'].next_steps && eligibleSchemes['PM-KISAN'].next_steps.length > 0 && (
                      <div className="mt-4 bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-emerald-600">✅</span> Next Steps
                        </h3>
                        <ul className="space-y-3">
                          {eligibleSchemes['PM-KISAN'].next_steps.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                                {idx + 1}
                              </span>
                              <span className="flex-1">{step}</span>
                            </li>
                          ))}
                          {/* Additional steps with portal link */}
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                              {eligibleSchemes['PM-KISAN'].next_steps.length + 1}
                            </span>
                            <span className="flex-1">
                              Apply through PM-KISAN portal:{' '}
                              <a 
                                href="https://pmkisan.gov.in/RegistrationForm.aspx" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                pmkisan.gov.in/RegistrationForm.aspx
                              </a>
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                              {eligibleSchemes['PM-KISAN'].next_steps.length + 2}
                            </span>
                            <span className="flex-1">Download and keep all required documents ready before applying</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                              {eligibleSchemes['PM-KISAN'].next_steps.length + 3}
                            </span>
                            <span className="flex-1">Track your application status regularly using your registration number</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Additional Details for Eligible Schemes */}
                    {eligibleSchemes['PM-KISAN'].eligible && (
                      <div className="mt-6 space-y-4">
                        {/* Benefits */}
                        {eligibleSchemes['PM-KISAN'].benefits && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">💰</span> Benefits
                            </h3>
                            <ul className="space-y-2">
                              {eligibleSchemes['PM-KISAN'].benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-emerald-600 mt-1">✓</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {/* Required Documents */}
                        {eligibleSchemes['PM-KISAN'].required_documents && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">📄</span> Required Documents
                            </h3>
                            <ul className="space-y-2">
                              {eligibleSchemes['PM-KISAN'].required_documents.map((doc: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-emerald-600 mt-1">•</span>
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {/* Application Process */}
                        {eligibleSchemes['PM-KISAN'].application_process && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">📝</span> How to Apply
                            </h3>
                            <ol className="space-y-3">
                              {eligibleSchemes['PM-KISAN'].application_process.map((step: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </motion.div>
                        )}

                        {/* Important Links */}
                        {eligibleSchemes['PM-KISAN'].important_links && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">🔗</span> Important Links
                            </h3>
                            <div className="space-y-2">
                              {Object.entries(eligibleSchemes['PM-KISAN'].important_links).map(([key, value]: [string, any]) => (
                                <a
                                  key={key}
                                  href={value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} →
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Contact Information */}
                        {eligibleSchemes['PM-KISAN'].contact_info && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">📞</span> Contact Information
                            </h3>
                            <div className="space-y-2">
                              {Object.entries(eligibleSchemes['PM-KISAN'].contact_info).map(([key, value]: [string, any]) => (
                                <p key={key}>
                                  <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                                  <span className="text-light-muted-foreground dark:text-dark-muted-foreground">{value}</span>
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Citation & Document Proof */}
                        {(eligibleSchemes['PM-KISAN'].citation || eligibleSchemes['PM-KISAN'].document_proof) && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-700">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-emerald-600">📋</span> Official Documentation
                            </h3>
                            {eligibleSchemes['PM-KISAN'].citation && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Citation:</p>
                                <p className="text-sm italic text-light-foreground dark:text-dark-foreground bg-white dark:bg-dark-background p-3 rounded border border-emerald-200 dark:border-emerald-800">
                                  "{eligibleSchemes['PM-KISAN'].citation}"
                                </p>
                              </div>
                            )}
                            {eligibleSchemes['PM-KISAN'].document_proof && (
                              <div>
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Document Reference:</p>
                                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                  {eligibleSchemes['PM-KISAN'].document_proof}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PM-KUSUM Scheme Card */}
                {eligibleSchemes['PM-KUSUM'] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                      eligibleSchemes['PM-KUSUM'].eligible
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600 hover:border-orange-600 dark:hover:border-orange-500'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          eligibleSchemes['PM-KUSUM'].eligible
                            ? 'bg-orange-100 dark:bg-orange-900/30'
                            : 'bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          {eligibleSchemes['PM-KUSUM'].eligible ? (
                            <CheckCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">PM-KUSUM</h2>
                          <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                            Solar Pump Subsidy Scheme
                          </p>
                        </div>
                      </div>
                      {eligibleSchemes['PM-KUSUM'].best_component && (
                        <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg">
                          <p className="text-orange-700 dark:text-orange-300 font-bold text-lg">
                            Best: {eligibleSchemes['PM-KUSUM'].best_component.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {eligibleSchemes['PM-KUSUM'].components && (
                      <div className="space-y-4">
                        {Object.entries(eligibleSchemes['PM-KUSUM'].components).map(([componentName, component]: [string, any]) => (
                          <div key={componentName} className="space-y-4">
                            <div
                              className={`p-6 rounded-xl border-2 ${
                                component.eligible
                                  ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                              }`}
                            >
                              <h3 className="font-semibold text-lg mb-2">{componentName.replace(/_/g, ' ')}</h3>
                              <p className={`text-lg font-semibold mb-2 ${
                                component.eligible
                                  ? 'text-orange-700 dark:text-orange-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {component.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                              </p>
                              <p className="text-light-foreground dark:text-dark-foreground">
                                {component.reason}
                              </p>
                            </div>

                            {/* Additional Details for Eligible Components */}
                            {component.eligible && (
                              <div className="ml-4 space-y-4">
                                {/* Benefits */}
                                {component.benefits && (
                                  <motion.div 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-dark-background rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                  >
                                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                      <span className="text-orange-600">💰</span> Benefits
                                    </h4>
                                    <ul className="space-y-2">
                                      {component.benefits.map((benefit: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-orange-600 mt-1">✓</span>
                                          <span>{benefit}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}

                                {/* Required Documents */}
                                {component.required_documents && (
                                  <motion.div 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-dark-background rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                  >
                                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                      <span className="text-orange-600">📄</span> Required Documents
                                    </h4>
                                    <ul className="space-y-2">
                                      {component.required_documents.map((doc: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-orange-600 mt-1">•</span>
                                          <span>{doc}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}

                                {/* Application Process */}
                                {component.application_process && (
                                  <motion.div 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-dark-background rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                  >
                                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                      <span className="text-orange-600">📝</span> How to Apply
                                    </h4>
                                    <ol className="space-y-3">
                                      {component.application_process.map((step: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3">
                                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-semibold">
                                            {idx + 1}
                                          </span>
                                          <span className="flex-1">{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Document Proof from API for PM-KUSUM */}
                        {eligibleSchemes['PM-KUSUM'].proof && eligibleSchemes['PM-KUSUM'].proof.length > 0 && (
                          <div className="mt-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-700">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-orange-600">📄</span> Document Proof
                            </h3>
                            <div className="space-y-4">
                              {eligibleSchemes['PM-KUSUM'].proof.slice(0, 2).map((proofItem: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-semibold text-orange-700 dark:text-orange-300">
                                      {proofItem.document_name}
                                    </p>
                                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                                      Page {proofItem.page_number}
                                    </span>
                                  </div>
                                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                                    {proofItem.line_reference}
                                  </p>
                                  <p className="text-sm text-light-foreground dark:text-dark-foreground italic bg-light-muted dark:bg-dark-muted p-3 rounded">
                                    "{proofItem.snippet.substring(0, 300)}..."
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next Steps from API for PM-KUSUM */}
                        {eligibleSchemes['PM-KUSUM'].next_steps && eligibleSchemes['PM-KUSUM'].next_steps.length > 0 && (
                          <div className="mt-4 bg-white dark:bg-dark-background rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-orange-600">✅</span> Next Steps
                            </h3>
                            <ul className="space-y-3">
                              {eligibleSchemes['PM-KUSUM'].next_steps.map((step: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1">{step}</span>
                                </li>
                              ))}
                              {/* Additional steps with portal link */}
                              <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-semibold">
                                  {eligibleSchemes['PM-KUSUM'].next_steps.length + 1}
                                </span>
                                <span className="flex-1">
                                  Apply through PM-KUSUM portal:{' '}
                                  <a 
                                    href="https://pmkusum.mnre.gov.in/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                  >
                                    pmkusum.mnre.gov.in
                                  </a>
                                </span>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-semibold">
                                  {eligibleSchemes['PM-KUSUM'].next_steps.length + 2}
                                </span>
                                <span className="flex-1">Contact your State Nodal Agency for component-specific application procedures</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-semibold">
                                  {eligibleSchemes['PM-KUSUM'].next_steps.length + 3}
                                </span>
                                <span className="flex-1">Get technical feasibility assessment done by empanelled vendors</span>
                              </li>
                            </ul>
                          </div>
                        )}

                        {/* Citation & Document Proof for PM-KUSUM */}
                        {(eligibleSchemes['PM-KUSUM'].citation || eligibleSchemes['PM-KUSUM'].document_proof) && (
                          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-700 mt-4">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-orange-600">📋</span> Official Documentation
                            </h3>
                            {eligibleSchemes['PM-KUSUM'].citation && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Citation:</p>
                                <p className="text-sm italic text-light-foreground dark:text-dark-foreground bg-white dark:bg-dark-background p-3 rounded border border-orange-200 dark:border-orange-800">
                                  "{eligibleSchemes['PM-KUSUM'].citation}"
                                </p>
                              </div>
                            )}
                            {eligibleSchemes['PM-KUSUM'].document_proof && (
                              <div>
                                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Document Reference:</p>
                                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                  {eligibleSchemes['PM-KUSUM'].document_proof}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* AIF Scheme Card */}
                {(() => {
                  const aifData = eligibleSchemes['AIF'] || eligibleSchemes['Agriculture Infrastructure Fund (AIF)'];
                  if (!aifData) return null;
                  
                  return (
                    <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                      aifData.eligible
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 hover:border-blue-600 dark:hover:border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          aifData.eligible
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          {aifData.eligible ? (
                            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">AIF</h2>
                          <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                            Agriculture Infrastructure Fund
                          </p>
                        </div>
                      </div>
                      {aifData.benefit_summary && (
                        <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                          <p className="text-blue-700 dark:text-blue-300 font-bold text-lg">
                            {aifData.benefit_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={`p-6 rounded-xl border-2 ${
                      aifData.eligible
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                    }`}>
                      <h3 className="font-semibold text-lg mb-2">Eligibility Status</h3>
                      <p className={`text-lg font-semibold mb-2 ${
                        aifData.eligible
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {aifData.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </p>
                      <p className="text-light-foreground dark:text-dark-foreground">
                        {aifData.reason_message}
                      </p>
                    </div>

                    {/* Document Proof from API for AIF */}
                    {aifData.proof && aifData.proof.length > 0 && (
                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-blue-600">📄</span> Document Proof
                        </h3>
                        <div className="space-y-4">
                          {aifData.proof.slice(0, 2).map((proofItem: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold text-blue-700 dark:text-blue-300">
                                  {proofItem.document_name}
                                </p>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                  Page {proofItem.page_number}
                                </span>
                              </div>
                              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                                {proofItem.line_reference}
                              </p>
                              <p className="text-sm text-light-foreground dark:text-dark-foreground italic bg-light-muted dark:bg-dark-muted p-3 rounded">
                                "{proofItem.snippet.substring(0, 300)}..."
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps from API for AIF */}
                    {aifData.next_steps && aifData.next_steps.length > 0 && (
                      <div className="mt-4 bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-blue-600">✅</span> Next Steps
                        </h3>
                        <ul className="space-y-3">
                          {aifData.next_steps.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                                {idx + 1}
                              </span>
                              <span className="flex-1">{step}</span>
                            </li>
                          ))}
                          {/* Additional steps with portal link */}
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                              {aifData.next_steps.length + 1}
                            </span>
                            <span className="flex-1">
                              Apply through NABARD portal:{' '}
                              <a 
                                href="https://www.nabard.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                nabard.org
                              </a>
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                              {aifData.next_steps.length + 2}
                            </span>
                            <span className="flex-1">Prepare detailed project report (DPR) with cost estimates and implementation timeline</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                              {aifData.next_steps.length + 3}
                            </span>
                            <span className="flex-1">Contact your nearest bank branch for loan application and subsidy processing</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Additional Details for Eligible Scheme */}
                    {aifData.eligible && (
                      <div className="mt-6 space-y-4">
                        {/* Benefits */}
                        {aifData.benefits && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">💰</span> Benefits
                            </h3>
                            <ul className="space-y-2">
                              {aifData.benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">✓</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {/* Required Documents */}
                        {aifData.required_documents && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">📄</span> Required Documents
                            </h3>
                            <ul className="space-y-2">
                              {aifData.required_documents.map((doc: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {/* Application Process */}
                        {aifData.application_process && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">📝</span> How to Apply
                            </h3>
                            <ol className="space-y-3">
                              {aifData.application_process.map((step: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </motion.div>
                        )}

                        {/* Important Links */}
                        {aifData.important_links && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">🔗</span> Important Links
                            </h3>
                            <div className="space-y-2">
                              {Object.entries(aifData.important_links).map(([key, value]: [string, any]) => (
                                <a
                                  key={key}
                                  href={value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} →
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Contact Information */}
                        {aifData.contact_info && (
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-dark-background rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">📞</span> Contact Information
                            </h3>
                            <div className="space-y-2">
                              {Object.entries(aifData.contact_info).map(([key, value]: [string, any]) => (
                                <p key={key}>
                                  <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                                  <span className="text-light-muted-foreground dark:text-dark-muted-foreground">{value}</span>
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Citation & Document Proof */}
                        {(aifData.citation || aifData.document_proof) && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="text-blue-600">📋</span> Official Documentation
                            </h3>
                            {aifData.citation && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Citation:</p>
                                <p className="text-sm italic text-light-foreground dark:text-dark-foreground bg-white dark:bg-dark-background p-3 rounded border border-blue-200 dark:border-blue-800">
                                  "{aifData.citation}"
                                </p>
                              </div>
                            )}
                            {aifData.document_proof && (
                              <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Document Reference:</p>
                                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                  {aifData.document_proof}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                  );
                })()}

                {/* Check Another Button */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setEligibleSchemes(null);
                      setIsEditing(false);
                      setTranscript('');
                      setFormData({
                        state: '',
                        district: '',
                        land_size: '',
                        crop_type: '',
                        category: '',
                        annual_income: '',
                        income_tax_payer: '',
                        pension: '',
                        pension_amount: '',
                        electricity_connection: '',
                      });
                    }}
                  >
                    Check Another Eligibility
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}


