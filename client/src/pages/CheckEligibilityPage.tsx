import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Edit2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

export function CheckEligibilityPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
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
    annual_income: '',
    electricity_connection: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<any>(null);
  const [error, setError] = useState('');

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
      setUser(userData);
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
      recognitionRef.current.lang = user?.language === 'Hindi' ? 'hi-IN' : 
                                     user?.language === 'Telugu' ? 'te-IN' :
                                     user?.language === 'Tamil' ? 'ta-IN' : 'en-IN';

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
  }, []);

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
      setError('No speech detected. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Call backend API to process the transcript and extract information
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/eligibility/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          ...data.extractedData,
        }));
        setIsEditing(true);
      } else {
        setError(data.message || 'Failed to process voice input');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
        setEligibleSchemes(data);
        
        // Save to history
        await saveToHistory(formData, data);
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
              <h1 className="text-4xl font-sans font-bold mb-4 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                Check Your Eligibility
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                Use voice input to quickly check which government schemes you're eligible for
              </p>
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
                  <h2 className="text-2xl font-bold mb-4">Step 1: Voice Input</h2>
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-8">
                    Click the microphone and tell us: your state, district, land size (in acres), crop type, category (General/OBC/SC/ST), annual income, whether you're an income tax payer, have pension, and electricity connection.
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
                      {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
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
                      <span>Processing your input...</span>
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
                      Skip & Fill Form Manually
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Section */}
            {isEditing && !eligibleSchemes && (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Step 2: Review & Edit Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Use Voice Input
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., Andhra Pradesh"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium mb-2">District *</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., Guntur"
                    />
                  </div>

                  {/* Land Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Land Size (acres) *</label>
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
                    <label className="block text-sm font-medium mb-2">Crop Type *</label>
                    <input
                      type="text"
                      value={formData.crop_type}
                      onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="e.g., Rice, Wheat, Cotton"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Income (₹) *</label>
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
                    <label className="block text-sm font-medium mb-2">Income Tax Payer *</label>
                    <select
                      value={formData.income_tax_payer}
                      onChange={(e) => setFormData({ ...formData, income_tax_payer: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Pension */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Receiving Pension *</label>
                    <select
                      value={formData.pension}
                      onChange={(e) => setFormData({ ...formData, pension: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Electricity Connection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Electricity Connection *</label>
                    <select
                      value={formData.electricity_connection}
                      onChange={(e) => setFormData({ ...formData, electricity_connection: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
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
                        Checking Eligibility...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Check Eligibility
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Results Section */}
            {eligibleSchemes && (
              <div className="space-y-6">
                {/* Summary Card */}
                {eligibleSchemes.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-2xl shadow-xl border-2 border-saffron/30 dark:border-saffron/50 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Recommendation</h2>
                        <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                          Best scheme for you
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-light-foreground dark:text-dark-foreground">
                      {eligibleSchemes.best_scheme}
                    </p>
                    <p className="text-lg mt-2 text-light-muted-foreground dark:text-dark-muted-foreground">
                      {eligibleSchemes.summary}
                    </p>
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
                      {eligibleSchemes['PM-KISAN'].benefit && (
                        <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                          <p className="text-green-700 dark:text-green-300 font-bold text-lg">
                            {eligibleSchemes['PM-KISAN'].benefit}
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
                      <p className={`text-lg font-semibold ${
                        eligibleSchemes['PM-KISAN'].eligible
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {eligibleSchemes['PM-KISAN'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </p>
                      <p className="mt-2 text-light-foreground dark:text-dark-foreground">
                        {eligibleSchemes['PM-KISAN'].reason?.message}
                      </p>
                    </div>

                    {/* Document Proof */}
                    {eligibleSchemes['PM-KISAN'].proof && eligibleSchemes['PM-KISAN'].proof.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Official Documentation
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['PM-KISAN'].proof.slice(0, 2).map((doc: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                                {doc.text.substring(0, 300)}...
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Source: {doc.scheme} - Page {doc.page}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {eligibleSchemes['PM-KISAN'].eligible && (
                      <div className="bg-white dark:bg-dark-background rounded-xl p-6 border-2 border-green-500 dark:border-green-600">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Next Steps
                        </h3>
                        <ol className="space-y-3 text-light-foreground dark:text-dark-foreground">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center text-sm font-bold border-2 border-green-600">1</span>
                            <span>Visit the official PM-KISAN portal at <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">pmkisan.gov.in</a></span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center text-sm font-bold border-2 border-green-600">2</span>
                            <span>Prepare required documents: Aadhaar card, land ownership documents, and bank account details</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center text-sm font-bold border-2 border-green-600">3</span>
                            <span>Register online or visit your nearest Common Service Centre (CSC)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center text-sm font-bold border-2 border-green-600">4</span>
                            <span>Complete the application form with accurate details</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center text-sm font-bold border-2 border-green-600">5</span>
                            <span>Track your application status using your registration number</span>
                          </li>
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
                      (eligibleSchemes['PM-KUSUM'].components?.Component_A?.eligible || 
                       eligibleSchemes['PM-KUSUM'].components?.Component_B?.eligible || 
                       eligibleSchemes['PM-KUSUM'].components?.Component_C?.eligible)
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">PM-KUSUM</h2>
                        <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                          Solar Agriculture Scheme
                        </p>
                      </div>
                    </div>

                    {/* Components */}
                    {eligibleSchemes['PM-KUSUM'].components && (
                      <div className="space-y-4 mb-6">
                        {Object.entries(eligibleSchemes['PM-KUSUM'].components).map(([componentName, component]: [string, any]) => (
                          <div
                            key={componentName}
                            className={`p-6 rounded-xl border-2 ${
                              component.eligible
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{componentName.replace(/_/g, ' ')}</h3>
                                <p className={`text-lg font-semibold mb-2 ${
                                  component.eligible
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {component.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                                </p>
                                <p className="text-light-foreground dark:text-dark-foreground">
                                  {component.reason?.message}
                                </p>
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
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Official Documentation
                        </h3>
                        <div className="space-y-4">
                          {eligibleSchemes['PM-KUSUM'].proof.slice(0, 2).map((doc: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-dark-background p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">
                                {doc.text.substring(0, 300)}...
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                                Source: {doc.scheme} - Page {doc.page}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {(eligibleSchemes['PM-KUSUM'].components?.Component_A?.eligible || 
                      eligibleSchemes['PM-KUSUM'].components?.Component_B?.eligible || 
                      eligibleSchemes['PM-KUSUM'].components?.Component_C?.eligible) && (
                      <div className="bg-white dark:bg-dark-background rounded-xl p-6 border-2 border-orange-500 dark:border-orange-600">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Next Steps
                        </h3>
                        <ol className="space-y-3 text-light-foreground dark:text-dark-foreground">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                            <span>Visit the official PM-KUSUM portal at <a href="https://pmkusum.mnre.gov.in" target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">pmkusum.mnre.gov.in</a></span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                            <span>Contact your State Nodal Agency for PM-KUSUM implementation</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                            <span>Prepare documents: land ownership proof, electricity bill, Aadhaar, and bank details</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                            <span>Get a feasibility assessment and cost estimate from empanelled vendors</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                            <span>Submit application with required documents and pay the processing fee</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</span>
                            <span>After approval, coordinate with vendor for installation and commissioning</span>
                          </li>
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

      <Footer />
    </div>
  );
}
