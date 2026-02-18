import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Mic, Upload, X, Play, Pause, AlertCircle, BookOpen } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

export function FeedbackPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'video' | 'audio' | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [convertingFeedback, setConvertingFeedback] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({
    farmerName: '',
    location: '',
    story: '',
    scheme: '',
    impact: '',
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // If admin, fetch all feedbacks
    if (userData.role === 'admin') {
      fetchFeedbacks();
    }
  }, [navigate]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const startRecording = async (type: 'video' | 'audio') => {
    try {
      setError('');
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setRecordingType(type);

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: type === 'video' ? 'video/webm' : 'audio/webm',
        });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access camera/microphone. Please grant permissions.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setRecordingType(null);
  };

  const uploadFeedback = async () => {
    if (!recordedBlob) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('feedback', recordedBlob, `feedback.${recordingType === 'video' ? 'webm' : 'webm'}`);
      formData.append('type', recordingType || '');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Upload failed');
        return;
      }

      // Reset state
      setRecordedBlob(null);
      setRecordingType(null);
      alert('Feedback submitted successfully!');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error uploading feedback:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConvertToStory = async (feedbackId: string) => {
    if (!storyForm.farmerName || !storyForm.location || !storyForm.story || !storyForm.scheme || !storyForm.impact) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/convert-to-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(storyForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Feedback converted to story successfully!');
        setConvertingFeedback(null);
        setStoryForm({
          farmerName: '',
          location: '',
          story: '',
          scheme: '',
          impact: '',
        });
      } else {
        alert(data.message || 'Failed to convert feedback');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-sans font-bold mb-2 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                Feedback
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                {user.role === 'admin' 
                  ? 'View feedback from all farmers'
                  : 'Share your feedback via video or audio'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Farmer View - Upload Feedback */}
            {user.role === 'farmer' && (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
                {!recordingType && !recordedBlob && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Choose Recording Type</h2>
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-8">
                      Select how you'd like to share your feedback
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <button
                        onClick={() => startRecording('video')}
                        className="p-8 rounded-xl border-2 border-light-border dark:border-dark-border hover:border-saffron dark:hover:border-saffron transition-all group"
                      >
                        <Video className="w-16 h-16 mx-auto mb-4 text-saffron" />
                        <h3 className="text-xl font-semibold mb-2">Video Feedback</h3>
                        <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                          Record a video message
                        </p>
                      </button>
                      <button
                        onClick={() => startRecording('audio')}
                        className="p-8 rounded-xl border-2 border-light-border dark:border-dark-border hover:border-green dark:hover:border-green transition-all group"
                      >
                        <Mic className="w-16 h-16 mx-auto mb-4 text-green" />
                        <h3 className="text-xl font-semibold mb-2">Audio Feedback</h3>
                        <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                          Record an audio message
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Recording Interface */}
                {isRecording && (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        Recording...
                      </div>
                    </div>
                    
                    {recordingType === 'video' && (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full max-w-2xl mx-auto rounded-lg mb-6"
                      />
                    )}

                    {recordingType === 'audio' && (
                      <div className="w-full max-w-2xl mx-auto mb-6 p-12 bg-gradient-to-r from-saffron/20 to-green/20 rounded-lg">
                        <Mic className="w-24 h-24 mx-auto text-saffron animate-pulse" />
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" size="lg" onClick={cancelRecording}>
                        <X className="w-5 h-5 mr-2" />
                        Cancel
                      </Button>
                      <Button variant="gradient" size="lg" onClick={stopRecording}>
                        <Pause className="w-5 h-5 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preview and Upload */}
                {recordedBlob && !isRecording && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">Preview Your Feedback</h2>
                    
                    {recordingType === 'video' && (
                      <video
                        src={URL.createObjectURL(recordedBlob)}
                        controls
                        className="w-full max-w-2xl mx-auto rounded-lg mb-6"
                      />
                    )}

                    {recordingType === 'audio' && (
                      <div className="w-full max-w-2xl mx-auto mb-6">
                        <audio
                          src={URL.createObjectURL(recordedBlob)}
                          controls
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" size="lg" onClick={cancelRecording}>
                        <X className="w-5 h-5 mr-2" />
                        Discard
                      </Button>
                      <Button
                        variant="gradient"
                        size="lg"
                        onClick={uploadFeedback}
                        disabled={isUploading}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {isUploading ? 'Uploading...' : 'Submit Feedback'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin View - View All Feedbacks */}
            {user.role === 'admin' && (
              <div className="space-y-6">
                {feedbacks.length === 0 ? (
                  <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-12 text-center">
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                      No feedback submissions yet
                    </p>
                  </div>
                ) : (
                  feedbacks.map((feedback) => (
                    <div
                      key={feedback._id}
                      className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6"
                    >
                      {convertingFeedback === feedback._id ? (
                        // Convert to Story Form
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold mb-4">Convert to Success Story</h3>
                          <div>
                            <label className="block text-sm font-medium mb-2">Farmer Name</label>
                            <input
                              type="text"
                              value={storyForm.farmerName}
                              onChange={(e) => setStoryForm({ ...storyForm, farmerName: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                              placeholder="Enter farmer name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                              type="text"
                              value={storyForm.location}
                              onChange={(e) => setStoryForm({ ...storyForm, location: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                              placeholder="e.g., Guntur, Andhra Pradesh"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Story</label>
                            <textarea
                              value={storyForm.story}
                              onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                              rows={4}
                              placeholder="Describe the farmer's journey and experience"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Scheme Used</label>
                            <input
                              type="text"
                              value={storyForm.scheme}
                              onChange={(e) => setStoryForm({ ...storyForm, scheme: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                              placeholder="e.g., PM-KISAN"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Impact</label>
                            <textarea
                              value={storyForm.impact}
                              onChange={(e) => setStoryForm({ ...storyForm, impact: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                              rows={3}
                              placeholder="Describe the positive impact"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setConvertingFeedback(null);
                                setStoryForm({
                                  farmerName: '',
                                  location: '',
                                  story: '',
                                  scheme: '',
                                  impact: '',
                                });
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleConvertToStory(feedback._id)}
                            >
                              Save as Story
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Normal Feedback View
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold">{feedback.farmerName}</h3>
                              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-saffron/10 text-saffron rounded-full text-sm">
                                {feedback.type}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setConvertingFeedback(feedback._id);
                                  setStoryForm({
                                    farmerName: feedback.farmerName,
                                    location: '',
                                    story: '',
                                    scheme: '',
                                    impact: '',
                                  });
                                }}
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Convert to Story
                              </Button>
                            </div>
                          </div>
                          
                          {feedback.type === 'video' ? (
                            <video
                              src={`http://localhost:5000${feedback.fileUrl}`}
                              controls
                              className="w-full rounded-lg"
                            />
                          ) : (
                            <audio
                              src={`http://localhost:5000${feedback.fileUrl}`}
                              controls
                              className="w-full"
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
