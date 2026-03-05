import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Edit2, CheckCircle, AlertCircle, Loader, Volume2, VolumeX } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Button } from '../components/ui/Button';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { translate, getSpeechRecognitionLanguage, speakText, stopSpeaking, translateText } from '../utils/translation';
import { BackButton } from '../components/ui/BackButton';
import { states, getDistricts } from '../data/statesDistricts';

export function CheckEligibilityPage() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('Check Your Eligibility');

  // Log language changes for debugging
  useEffect(() => {
    console.log('Language changed to:', selectedLanguage);
    const newTitle = translate('check_eligibility', selectedLanguage);
    console.log('Translation test:', newTitle);
    setTranslatedTitle(newTitle);
  }, [selectedLanguage]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    land_size: '',
    crop_type: '',
    category: '',
    income_tax_payer: '',
    pension: '',
    pension_amount: '',
    annual_income: '',
    electricity_connection: '',
  });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<any>(null);
  const [error, setError] = useState('');

  // Update districts when state changes
  useEffect(() => {
    if (formData.state) {
      const districts = getDistricts(formData.state);
      setAvailableDistricts(districts);
      // Reset district if it's not in the new state's districts
      if (formData.district && !districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state, formData.district]);

  const recognitionRef = useRef<any>(null);

  const saveToHistory = async (inputData: any, outputData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Skip if not logged in

      const eligibleSchemes = [];
      if (outputData['PM-KISAN']?.eligible) eligibleSchemes.push('PM-KISAN');
      if (outputData['PM-KUSUM']?.components) {
        const eligibleComponents = Object.entries(outputData['PM-KUSUM'].components)
          .filter(([_, comp]: [string, any]) => comp.eligible)
          .map(([name, _]) => `PM-KUSUM ${name.replace(/_/g, ' ')}`);
        eligibleSchemes.push(...eligibleComponents);
      }

      const title = eligibleSchemes.length > 0 
        ? `Eligible for ${eligibleSchemes.join(', ')}`
        : 'Eligibility Check Completed';

      const description = outputData.best_scheme 
        ? `Best scheme: ${outputData.best_scheme}. ${outputData.summary || ''}`
        : 'Checked eligibility for government schemes';

      // Format input data to match History page expectations
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

      console.log('Saving to history:', {
        inputData: formattedInputData,
        outputData,
      });

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
      // Don't show error to user, just log it
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Set language from user profile or default to English
      const userLanguage = userData.language?.toLowerCase() || 'en';
      console.log('Setting initial language from user profile:', userLanguage);
      setSelectedLanguage(userLanguage);
      // Pre-fill some data from user profile
      setFormData(prev => ({
        ...prev,
        state: userData.state || '',
        district: userData.district || '',
      }));
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error. Please try again.');
        setIsRecording(false);
      };
    }
  }, []); // Only run once on mount

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechRecognitionLanguage(selectedLanguage);
      console.log('Updated speech recognition language to:', getSpeechRecognitionLanguage(selectedLanguage));
    }
  }, [selectedLanguage]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      setError('Speech recognition is not supported in your browser.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Process the transcript
      processTranscript(transcript);
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      setError(translate('no_speech_detected', selectedLanguage));
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Translate the transcript to English if not already in English
      let englishText = text;
      if (selectedLanguage !== 'en') {
        console.log('Translating from', selectedLanguage, 'to English:', text);
        englishText = await translateText(text, selectedLanguage, 'en');
        console.log('Translated text:', englishText);
      }
      
      // Enable editing mode
      setIsEditing(true);
      
      // Extract information from the English transcript
      const lowerText = englishText.toLowerCase();
      console.log('Parsing text:', lowerText);
      
      // Extract state - more flexible patterns
      const statePatterns = [
        /(?:state|province)(?:\s+is|\s+of|\s*:|\s+name)?\s+([a-z\s]+?)(?:\s+(?:and|district|,|my|i|the|am|from)|\.|$)/i,
        /(?:from|in)\s+([a-z\s]+?)\s+(?:state|district)/i,
        /([a-z\s]+?)\s+state/i,
      ];
      for (const pattern of statePatterns) {
        const match = lowerText.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          let state = match[1].trim();
          // Remove common filler words and phrases
          state = state.replace(/\b(and|my|the|is|of|i|am|from|our)\b/gi, '').trim();
          // Remove extra spaces
          state = state.replace(/\s+/g, ' ');
          
          // Skip if too short after cleaning
          if (state.length > 2) {
            // Capitalize first letter of each word
            const capitalizedState = state.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            setFormData(prev => ({ ...prev, state: capitalizedState }));
            console.log('Found state:', capitalizedState);
            break;
          }
        }
      }
      
      // Extract district - more flexible patterns
      const districtPatterns = [
        /district(?:\s+is|\s+of|\s*:|\s+name)?\s+([a-z\s]+?)(?:\s+(?:and|,|my|i|the|land|am|from)|\.|$)/i,
        /(?:from|in)\s+([a-z\s]+?)\s+district/i,
        /([a-z\s]+?)\s+district/i,
      ];
      for (const pattern of districtPatterns) {
        const match = lowerText.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          let district = match[1].trim();
          // Remove filler words and phrases
          district = district.replace(/\b(and|my|the|is|of|our|i|am|from|telangana|state)\b/gi, '').trim();
          // Remove extra spaces
          district = district.replace(/\s+/g, ' ');
          
          // Skip if district is too short or just filler words
          if (district.length > 2 && !['and', 'my', 'the', 'is', 'of', 'am', 'from'].includes(district.toLowerCase())) {
            const capitalizedDistrict = district.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            setFormData(prev => ({ ...prev, district: capitalizedDistrict }));
            console.log('Found district:', capitalizedDistrict);
            break;
          }
        }
      }
      
      // Extract land size - look for numbers with acres/hectares (including word numbers)
      const numberWords: Record<string, string> = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
        'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
        'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
        'eighty': '80', 'ninety': '90', 'hundred': '100'
      };
      
      const landPatterns = [
        // Numeric patterns
        /(\d+(?:\.\d+)?)\s*(?:acres?|acre|hectares?|hectare)/i,
        /(?:land|farm|field)(?:\s+(?:is|of|size))?\s*(?:is)?\s*(\d+(?:\.\d+)?)/i,
        // Word number patterns
        /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s*(?:acres?|acre|hectares?|hectare)/i,
        /(?:land|farm|field)(?:\s+(?:is|of|size))?\s*(?:is)?\s*(one|two|three|four|five|six|seven|eight|nine|ten)/i,
      ];
      
      for (const pattern of landPatterns) {
        const match = lowerText.match(pattern);
        if (match && match[1]) {
          let landSize = match[1];
          // Convert word to number if needed
          if (numberWords[landSize.toLowerCase()]) {
            landSize = numberWords[landSize.toLowerCase()];
          }
          setFormData(prev => ({ ...prev, land_size: landSize }));
          console.log('Found land size:', landSize);
          break;
        }
      }
      
      // Extract crop type - more flexible with spell correction
      const cropCorrections: Record<string, string> = {
        'maze': 'Maize',
        'maiz': 'Maize',
        'maize': 'Maize',
        'paddy': 'Rice',
        'dhan': 'Rice',
        'rice': 'Rice',
        'wheat': 'Wheat',
        'cotton': 'Cotton',
        'sugarcane': 'Sugarcane',
        'groundnut': 'Groundnut',
        'peanut': 'Groundnut',
        'soybean': 'Soybean',
        'soya': 'Soybean',
        'chilli': 'Chilli',
        'chili': 'Chilli',
        'tomato': 'Tomato',
        'potato': 'Potato',
        'onion': 'Onion',
        'turmeric': 'Turmeric',
        'pulses': 'Pulses',
        'dal': 'Pulses',
        'microb': 'Microbe',
        'microbe': 'Microbe',
        'jowar': 'Jowar',
        'bajra': 'Bajra',
        'ragi': 'Ragi',
      };
      
      const cropPatterns = [
        /(?:crop|crops|growing|cultivate|cultivating)(?:\s+(?:is|are|type))?\s*(?:is)?\s*([a-z\s,]+?)(?:\s+(?:and|my|i|the|category|land|acre)|\.|$)/i,
        /(?:plant|planting)\s+([a-z\s,]+?)(?:\s+(?:and|my|i|land|acre)|\.|$)/i,
        /(?:type|types)(?:\s+is)?\s+([a-z\s,]+?)(?:\s+(?:and|my|i|the|category)|\.|$)/i,
      ];
      for (const pattern of cropPatterns) {
        const match = lowerText.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          let crop = match[1].trim().toLowerCase();
          // Remove filler words
          crop = crop.replace(/\b(and|my|the|is|of|our|type|types)\b/gi, '').trim();
          // Remove extra spaces
          crop = crop.replace(/\s+/g, ' ');
          
          // Skip if too short after cleaning
          if (crop.length < 3) continue;
          
          // Apply spell correction
          if (cropCorrections[crop]) {
            crop = cropCorrections[crop];
          } else {
            // Capitalize first letter of each word
            crop = crop.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
          
          setFormData(prev => ({ ...prev, crop_type: crop }));
          console.log('Found crop:', crop);
          break;
        }
      }
      
      // Extract category - check for keywords
      if (lowerText.match(/\bgeneral\b/i)) {
        setFormData(prev => ({ ...prev, category: 'General' }));
        console.log('Found category: General');
      } else if (lowerText.match(/\bobc\b/i) || lowerText.includes('other backward')) {
        setFormData(prev => ({ ...prev, category: 'OBC' }));
        console.log('Found category: OBC');
      } else if (lowerText.match(/\bsc\b/i) || lowerText.includes('scheduled caste')) {
        setFormData(prev => ({ ...prev, category: 'SC' }));
        console.log('Found category: SC');
      } else if (lowerText.match(/\bst\b/i) || lowerText.includes('scheduled tribe')) {
        setFormData(prev => ({ ...prev, category: 'ST' }));
        console.log('Found category: ST');
      }
      
      // Extract annual income - look for numbers
      const incomePatterns = [
        /(?:income|earning|salary)(?:\s+(?:is|of))?\s*(?:is)?\s*(?:rupees|rs|₹)?\s*(\d+(?:,\d+)*)/i,
        /(\d+(?:,\d+)*)\s*(?:rupees|rs|₹)?\s*(?:income|earning|salary)/i,
        /(?:earn|make)\s*(?:rupees|rs|₹)?\s*(\d+(?:,\d+)*)/i,
      ];
      for (const pattern of incomePatterns) {
        const match = lowerText.match(pattern);
        if (match && match[1]) {
          const income = match[1].replace(/,/g, '');
          setFormData(prev => ({ ...prev, annual_income: income }));
          console.log('Found income:', income);
          break;
        }
      }
      
      // Extract yes/no answers - income tax payer
      if (lowerText.match(/(?:not|no|don't|do not).*(?:income tax|tax payer)/i) || 
          lowerText.match(/income tax.*(?:no|not)/i)) {
        setFormData(prev => ({ ...prev, income_tax_payer: 'No' }));
        console.log('Income tax payer: No');
      } else if (lowerText.match(/(?:yes|am|is).*(?:income tax|tax payer)/i) || 
                 lowerText.match(/(?:pay|paying).*(?:income tax|tax)/i)) {
        setFormData(prev => ({ ...prev, income_tax_payer: 'Yes' }));
        console.log('Income tax payer: Yes');
      }
      
      // Extract pension status - improved logic
      if (lowerText.match(/(?:will\s+)?(?:receive|get|have).*pension/i) || 
          lowerText.match(/pension.*(?:yes|have|receive|get)/i)) {
        setFormData(prev => ({ ...prev, pension: 'Yes' }));
        console.log('Pension: Yes');
      } else if (lowerText.match(/(?:not|no|don't|do not|will not|won't).*pension/i) || 
                 lowerText.match(/pension.*(?:no|not)/i)) {
        setFormData(prev => ({ ...prev, pension: 'No' }));
        console.log('Pension: No');
      }
      
      // Extract electricity connection
      if (lowerText.match(/(?:not|no|don't|do not).*(?:electricity|electric|power)/i) || 
          lowerText.match(/(?:electricity|electric|power).*(?:no|not)/i)) {
        setFormData(prev => ({ ...prev, electricity_connection: 'No' }));
        console.log('Electricity: No');
      } else if (lowerText.match(/(?:yes|have|has).*(?:electricity|electric|power|connection)/i) || 
                 lowerText.match(/(?:electricity|electric|power).*(?:yes|have|connection)/i)) {
        setFormData(prev => ({ ...prev, electricity_connection: 'Yes' }));
        console.log('Electricity: Yes');
      }
      
    } catch (err) {
      console.error('Process transcript error:', err);
      setError(translate('speech_error', selectedLanguage));
    } finally {
      setIsProcessing(false);
    }
  };

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

      // Convert Yes/No to 1/0 for the API - ensure proper conversion
      const requestBody = {
        land_size: parseFloat(formData.land_size) || 0,
        income_tax_payer: formData.income_tax_payer === 'Yes' ? 1 : 0,
        pension: formData.pension === 'Yes' ? 1 : 0,
        annual_income: parseFloat(formData.annual_income) || 0,
        electricity_connection: formData.electricity_connection === 'Yes' ? 1 : 0,
        category: formData.category,
        state: formData.state,
        district: formData.district,
        crop_type: formData.crop_type,
      };

      console.log('Sending request to Hugging Face:', requestBody);

      // Call Hugging Face endpoint
      const response = await fetch('https://sivasai07-niti-setu-eligibility.hf.space/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        setError('Server returned invalid response. Please try again.');
        return;
      }

      console.log('Parsed response data:', data);

      if (response.ok) {
        // Handle new API response format with data wrapper
        const resultsData = data.data || data;
        console.log('Results data to set:', resultsData);
        console.log('Has scheme_comparison?', !!resultsData.scheme_comparison);
        console.log('Has PM-KISAN?', !!resultsData['PM-KISAN']);
        console.log('Has PM-KUSUM?', !!resultsData['PM-KUSUM']);
        setEligibleSchemes(resultsData);
        
        // Save to history
        await saveToHistory(formData, resultsData);
      } else {
        // Handle validation errors from FastAPI
        if (data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
            return `${field}: ${err.msg}`;
          }).join('; ');
          setError(`Validation error: ${errorMessages}`);
        } else if (typeof data.detail === 'string') {
          setError(data.detail);
        } else {
          setError(data.message || data.error || 'Failed to check eligibility. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Eligibility check error:', err);
      setError(`Network error: ${err.message}. Please check your internet connection and try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakResult = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text, selectedLanguage);
      setIsSpeaking(true);
      // Reset speaking state when done
      setTimeout(() => setIsSpeaking(false), text.length * 50); // Rough estimate
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton />
          </div>

          <motion.div
            key={selectedLanguage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4 flex-col">
                <h1 className="text-4xl font-sans font-bold bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                  {translatedTitle}
                </h1>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                  Use voice input to quickly check which government schemes you're eligible for
                </p>
              </div>
              {/* Language Selector */}
              <div className="flex justify-center">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
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
                  <h2 className="text-2xl font-bold mb-4">{translate('step_1', selectedLanguage)}: {translate('use_voice_input', selectedLanguage)}</h2>
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-8">
                    {translate('voice_instruction', selectedLanguage)}
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
                      {isRecording ? translate('stop_recording', selectedLanguage) : translate('start_recording', selectedLanguage)}
                    </p>
                  </div>

                  {transcript && (
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4 text-left">
                      <h3 className="font-semibold mb-2">Transcript:</h3>
                      <p className="text-sm">{transcript}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 text-saffron">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>{translate('processing', selectedLanguage)}</span>
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
                      {translate('skip_fill_manually', selectedLanguage)}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Section */}
            {isEditing && !eligibleSchemes && (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{translate('step_2', selectedLanguage)}: Review & Edit Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {translate('use_voice_input', selectedLanguage)}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('state', selectedLanguage)} *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      required
                    >
                      <option value="">{translate('state_placeholder', selectedLanguage)}</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('district', selectedLanguage)} *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!formData.state}
                      required
                    >
                      <option value="">
                        {formData.state 
                          ? translate('district_placeholder', selectedLanguage)
                          : 'Select state first'}
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
                    <label className="block text-sm font-medium mb-2">{translate('land_size', selectedLanguage)} *</label>
                    <input
                      type="text"
                      value={formData.land_size}
                      onChange={(e) => setFormData({ ...formData, land_size: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder={translate('land_size_placeholder', selectedLanguage)}
                    />
                  </div>

                  {/* Crop Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('crop_type', selectedLanguage)} *</label>
                    <input
                      type="text"
                      value={formData.crop_type}
                      onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder={translate('crop_type_placeholder', selectedLanguage)}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('category', selectedLanguage)} *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{translate('select_category', selectedLanguage)}</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('annual_income', selectedLanguage)} *</label>
                    <input
                      type="text"
                      value={formData.annual_income}
                      onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder={translate('income_placeholder', selectedLanguage)}
                    />
                  </div>

                  {/* Income Tax Payer */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('income_tax_payer', selectedLanguage)} *</label>
                    <select
                      value={formData.income_tax_payer}
                      onChange={(e) => setFormData({ ...formData, income_tax_payer: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{translate('select', selectedLanguage)}</option>
                      <option value="Yes">{translate('yes', selectedLanguage)}</option>
                      <option value="No">{translate('no', selectedLanguage)}</option>
                    </select>
                  </div>

                  {/* Pension */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{translate('pension', selectedLanguage)} *</label>
                    <select
                      value={formData.pension}
                      onChange={(e) => {
                        setFormData({ ...formData, pension: e.target.value, pension_amount: e.target.value === 'No' ? '0' : formData.pension_amount });
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{translate('select', selectedLanguage)}</option>
                      <option value="Yes">{translate('yes', selectedLanguage)}</option>
                      <option value="No">{translate('no', selectedLanguage)}</option>
                    </select>
                  </div>

                  {/* Pension Amount - Conditional */}
                  {formData.pension === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Pension Amount (₹) *</label>
                      <input
                        type="number"
                        value={formData.pension_amount}
                        onChange={(e) => setFormData({ ...formData, pension_amount: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                        placeholder="Enter monthly pension amount (or 0 if not receiving)"
                        min="0"
                      />
                    </div>
                  )}

                  {formData.pension === 'No' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Pension Amount (₹) *</label>
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
                    <label className="block text-sm font-medium mb-2">{translate('electricity_connection', selectedLanguage)} *</label>
                    <select
                      value={formData.electricity_connection}
                      onChange={(e) => setFormData({ ...formData, electricity_connection: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">{translate('select', selectedLanguage)}</option>
                      <option value="Yes">{translate('yes', selectedLanguage)}</option>
                      <option value="No">{translate('no', selectedLanguage)}</option>
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
                        {translate('checking_eligibility', selectedLanguage)}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {translate('check_eligibility_btn', selectedLanguage)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Results Section */}
            {eligibleSchemes && (
              <div className="space-y-6">
                {/* Recommended Scheme Card */}
                {eligibleSchemes.scheme_comparison && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-2xl shadow-xl border-2 border-saffron/30 dark:border-saffron/50 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
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
                        onClick={() => handleSpeakResult(`Recommended scheme: ${eligibleSchemes.scheme_comparison.recommended_scheme}. ${eligibleSchemes.summary}`)}
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
                        {eligibleSchemes.scheme_comparison.recommended_scheme}
                      </p>
                      <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground">
                        {eligibleSchemes.scheme_comparison.comparison_note}
                      </p>
                    </div>

                    {/* Scheme Comparison Summary */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Total Eligible Schemes</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
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
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      eligibleSchemes['PM-KISAN'].eligible
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          eligibleSchemes['PM-KISAN'].eligible
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {eligibleSchemes['PM-KISAN'].eligible ? (
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
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
                        <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                          <p className="text-green-700 dark:text-green-300 font-bold text-lg">
                            {eligibleSchemes['PM-KISAN'].benefit_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Eligibility Status */}
                    <div className={`p-6 rounded-xl border-2 mb-6 ${
                      eligibleSchemes['PM-KISAN'].eligible
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <h3 className="font-semibold text-lg mb-2">Eligibility Status</h3>
                      <p className={`text-lg font-semibold mb-2 ${
                        eligibleSchemes['PM-KISAN'].eligible
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {eligibleSchemes['PM-KISAN'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </p>
                      <p className="text-light-foreground dark:text-dark-foreground">
                        {eligibleSchemes['PM-KISAN'].reason_message}
                      </p>
                      {eligibleSchemes['PM-KISAN'].confidence_score && (
                        <div className="mt-3">
                          <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                            Confidence Score
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${eligibleSchemes['PM-KISAN'].confidence_score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Proof */}
                    {eligibleSchemes['PM-KISAN'].proof && eligibleSchemes['PM-KISAN'].proof.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          📄 Official Documentation Proof
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['PM-KISAN'].proof.map((doc: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    {doc.document_name}
                                  </p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                    📍 Page {doc.page_number} • Section: {doc.section} • Relevance: {(doc.relevance_score * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border-l-4 border-blue-500">
                                <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed italic">
                                  "{doc.snippet ? doc.snippet.substring(0, 300) : 'No snippet available'}..."
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {eligibleSchemes['PM-KISAN'].next_steps && eligibleSchemes['PM-KISAN'].next_steps.length > 0 && (
                      <div className="bg-white dark:bg-dark-background rounded-xl p-6 border-2 border-green-500 dark:border-green-600">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          🚀 Next Steps to Apply
                        </h3>
                        <ol className="space-y-3 text-light-foreground dark:text-dark-foreground">
                          {eligibleSchemes['PM-KISAN'].next_steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
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
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      eligibleSchemes['PM-KUSUM'].eligible
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
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
                          <p className="text-orange-700 dark:text-orange-300 font-bold text-sm">
                            Best: {eligibleSchemes['PM-KUSUM'].best_component.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Components */}
                    {eligibleSchemes['PM-KUSUM'].components && (
                      <div className="space-y-4 mb-6">
                        {Object.entries(eligibleSchemes['PM-KUSUM'].components).map(([componentName, component]: [string, any]) => (
                          <div
                            key={componentName}
                            className={`p-6 rounded-xl border-2 ${
                              component.eligible
                                ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
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
                                {component.component_score && (
                                  <div className="mt-2">
                                    <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                                      Component Score: {component.component_score}%
                                    </p>
                                  </div>
                                )}
                              </div>
                              {component.subsidy_percent && (
                                <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg ml-4">
                                  <p className="text-orange-700 dark:text-orange-300 font-bold">
                                    {component.subsidy_percent}% Subsidy
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Document Proof */}
                    {eligibleSchemes['PM-KUSUM'].proof && eligibleSchemes['PM-KUSUM'].proof.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 mb-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          📄 Official Documentation Proof
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['PM-KUSUM'].proof.map((doc: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                    {doc.document_name}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                    📍 Page {doc.page_number} • Relevance: {(doc.relevance_score * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded border-l-4 border-purple-500">
                                <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed italic">
                                  "{doc.snippet ? doc.snippet.substring(0, 300) : 'No snippet available'}..."
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {eligibleSchemes['PM-KUSUM'].next_steps && eligibleSchemes['PM-KUSUM'].next_steps.length > 0 && (
                      <div className="bg-white dark:bg-dark-background rounded-xl p-6 border-2 border-orange-500 dark:border-orange-600">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          🚀 Next Steps to Apply
                        </h3>
                        <ol className="space-y-3 text-light-foreground dark:text-dark-foreground">
                          {eligibleSchemes['PM-KUSUM'].next_steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Agriculture Infrastructure Fund (AIF) Card */}
                {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`rounded-2xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible ? (
                            <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Agriculture Infrastructure Fund</h2>
                          <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                            AIF - Infrastructure Development
                          </p>
                        </div>
                      </div>
                      {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].benefit_summary && (
                        <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                          <p className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                            {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].benefit_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Eligibility Status */}
                    <div className={`p-6 rounded-xl border-2 mb-6 ${
                      eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                    }`}>
                      <h3 className="font-semibold text-lg mb-2">Eligibility Status</h3>
                      <p className={`text-lg font-semibold mb-2 ${
                        eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </p>
                      <p className="text-light-foreground dark:text-dark-foreground">
                        {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].reason_message}
                      </p>
                      {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].confidence_score && (
                        <div className="mt-3">
                          <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                            Confidence Score
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].confidence_score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Proof */}
                    {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].proof && eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].proof.length > 0 && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 mb-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          📄 Official Documentation Proof
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].proof.map((doc: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                                    {doc.document_name}
                                  </p>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">
                                    📍 Page {doc.page_number} • Relevance: {(doc.relevance_score * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded border-l-4 border-indigo-500">
                                <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed italic">
                                  "{doc.snippet ? doc.snippet.substring(0, 300) : 'No snippet available'}..."
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].next_steps && eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].next_steps.length > 0 && (
                      <div className="bg-white dark:bg-dark-background rounded-xl p-6 border-2 border-blue-500 dark:border-blue-600">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          🚀 Next Steps to Apply
                        </h3>
                        <ol className="space-y-3 text-light-foreground dark:text-dark-foreground">
                          {eligibleSchemes['Agriculture Infrastructure Fund (AIF)'].next_steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setEligibleSchemes(null);
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Check Again
                  </Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
