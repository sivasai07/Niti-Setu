import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Save, X, Upload, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    language: '',
    profilePicture: '',
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPictureOptions, setShowPictureOptions] = useState(false);
  const [pictureUrl, setPictureUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringPicture, setIsHoveringPicture] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData({
      name: userData.name || '',
      username: userData.username || '',
      phoneNumber: userData.phoneNumber || '',
      city: userData.city || '',
      district: userData.district || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      language: userData.language || '',
      profilePicture: userData.profilePicture || '',
      currentPin: '',
      newPin: '',
      confirmPin: '',
    });
  }, [navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profilePicture: 'Image size must be less than 5MB' });
        return;
      }

      // Clear any previous errors
      const newErrors = { ...errors };
      delete newErrors.profilePicture;
      setErrors(newErrors);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
        setShowPictureOptions(false);
      };
      reader.onerror = () => {
        setErrors({ ...errors, profilePicture: 'Failed to read image file' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      setShowPictureOptions(false);
      
      // Clear any previous errors
      const newErrors = { ...errors };
      delete newErrors.profilePicture;
      setErrors(newErrors);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with 80% quality
        setFormData({ ...formData, profilePicture: imageData });
        stream.getTracks().forEach(track => track.stop());
      }, 100);
    } catch (error) {
      setErrors({ ...errors, profilePicture: 'Camera access denied or not available' });
    }
  };

  const handleUrlSubmit = () => {
    if (pictureUrl) {
      // Clear any previous errors
      const newErrors = { ...errors };
      delete newErrors.profilePicture;
      setErrors(newErrors);

      setFormData({ ...formData, profilePicture: pictureUrl });
      setPictureUrl('');
      setShowPictureOptions(false);
    }
  };

  const handleRemovePicture = async () => {
    setFormData({ ...formData, profilePicture: '' });
    setShowRemoveModal(false);
    
    // Save immediately to DB
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePicture: '' }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error removing picture:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate PIN fields
    if (formData.newPin) {
      if (!formData.currentPin) {
        setErrors({ currentPin: 'Current PIN is required to change PIN' });
        setIsLoading(false);
        return;
      }
      if (formData.newPin !== formData.confirmPin) {
        setErrors({ confirmPin: 'PINs do not match' });
        setIsLoading(false);
        return;
      }
      if (formData.newPin.length !== 6 || !/^\d+$/.test(formData.newPin)) {
        setErrors({ newPin: 'PIN must be 6 digits' });
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        language: formData.language,
        profilePicture: formData.profilePicture,
      };

      if (formData.newPin && formData.currentPin) {
        updateData.newPin = formData.newPin;
        updateData.currentPin = formData.currentPin;
      }

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field === 'username') {
          setErrors({ username: data.message });
        } else if (data.field === 'currentPin') {
          setErrors({ currentPin: data.message });
        } else {
          setErrors({ general: data.message || 'Update failed' });
        }
        return;
      }

      // Update local storage
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Trigger a custom event to update navbar
      window.dispatchEvent(new Event('userUpdated'));
      
      setSuccessMessage('Saved changes successfully');
      
      // Clear PIN fields
      setFormData({
        ...formData,
        currentPin: '',
        newPin: '',
        confirmPin: '',
      });

      // Switch back to view mode after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setIsEditing(false);
      }, 2000);
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || '',
        language: user.language || '',
        profilePicture: user.profilePicture || '',
        currentPin: '',
        newPin: '',
        confirmPin: '',
      });
    }
    setErrors({});
    setSuccessMessage('');
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

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
            <div className="mb-8">
              <h1 className="text-4xl font-sans font-bold mb-2 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                View and manage your account information
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 relative">
              {/* Edit Profile Button - Top Right Corner Inside Card - only in view mode */}
              {!isEditing && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-6 right-6"
                >
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              )}

              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8 pb-6 border-b border-light-border dark:border-dark-border">
                <div 
                  className="relative group"
                  onMouseEnter={() => setIsHoveringPicture(true)}
                  onMouseLeave={() => setIsHoveringPicture(false)}
                >
                  {formData.profilePicture ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      src={formData.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-saffron to-green cursor-pointer"
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="w-32 h-32 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center text-white text-5xl font-bold cursor-pointer"
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </motion.div>
                  )}
                  
                  {/* Trash icon on hover - only in edit mode */}
                  {isEditing && isHoveringPicture && formData.profilePicture && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setShowRemoveModal(true)}
                      className="absolute -right-2 top-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 hover:scale-110 transition-all shadow-lg"
                      title="Remove profile picture"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                  {user.role === 'admin' ? 'Administrator' : 'Farmer'}
                </p>

                {/* Success Message - Below profile icon, above buttons */}
                {successMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-green-600 dark:text-green-400 font-semibold text-lg text-center"
                  >
                    {successMessage}
                  </motion.p>
                )}

                {/* Profile Picture Buttons - only in edit mode - Centered */}
                {isEditing && (
                  <>
                    <div className="flex justify-center gap-3 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowPictureOptions(!showPictureOptions);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all"
                      >
                        <LinkIcon className="w-4 h-4 text-white" />
                        <span className="text-white font-semibold">URL</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowPictureOptions(false);
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        <Upload className="w-4 h-4 text-white" />
                        <span className="text-white font-semibold">Upload</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowPictureOptions(false);
                          handleCameraCapture();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-orange-500/50 transition-all"
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-white font-bold">Camera</span>
                      </motion.button>
                    </div>

                    {/* Profile Picture Error */}
                    {errors.profilePicture && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{errors.profilePicture}</p>
                    )}

                    {/* URL Input - Centered */}
                    <AnimatePresence>
                      {showPictureOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 w-full flex justify-center"
                        >
                          <div className="flex gap-2 w-full max-w-md">
                            <input
                              type="text"
                              value={pictureUrl}
                              onChange={(e) => setPictureUrl(e.target.value)}
                              placeholder="Enter image URL"
                              className="flex-1 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                            />
                            <Button variant="gradient" size="sm" onClick={handleUrlSubmit}>
                              Set
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Profile Information */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.name}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                        />
                        {errors.username && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                        )}
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg text-light-muted-foreground dark:text-dark-muted-foreground">
                    {user.phoneNumber} (Cannot be changed)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      City / Area
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.city}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium mb-2">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.district}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.state}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                        maxLength={6}
                      />
                    ) : (
                      <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                        {user.pincode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Language</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="Enter your native/preferred language"
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                      {user.language}
                    </p>
                  )}
                </div>

                {/* Change PIN Section - only in edit mode */}
                {isEditing && (
                  <div className="pt-6 border-t border-light-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold mb-4">Change PIN</h3>
                    
                    <div className="space-y-4">
                      {/* Current PIN */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Current PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={formData.currentPin}
                          onChange={(e) => setFormData({ ...formData, currentPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          placeholder="Enter current 6-digit PIN"
                          className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                        />
                        {errors.currentPin && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPin}</p>
                        )}
                      </div>

                      {/* New PIN */}
                      <div>
                        <label className="block text-sm font-medium mb-2">New PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={formData.newPin}
                          onChange={(e) => setFormData({ ...formData, newPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          placeholder="Enter new 6-digit PIN"
                          className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                        />
                        {errors.newPin && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPin}</p>
                        )}
                      </div>

                      {/* Confirm PIN - Only show when user starts typing new PIN */}
                      <AnimatePresence>
                        {formData.newPin && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <label className="block text-sm font-medium mb-2">Re-enter New PIN</label>
                            <input
                              type="password"
                              inputMode="numeric"
                              maxLength={6}
                              value={formData.confirmPin}
                              onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                              placeholder="Re-enter new 6-digit PIN"
                              className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                            />
                            {errors.confirmPin && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPin}</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Action Buttons - only in edit mode */}
                {isEditing && (
                  <div className="flex gap-4 pt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        variant="gradient"
                        size="lg"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full shadow-lg hover:shadow-xl"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        className="w-full"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Remove Picture Confirmation Modal */}
      <AnimatePresence>
        {showRemoveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRemoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-background rounded-2xl p-8 max-w-md w-full shadow-2xl border border-light-border dark:border-dark-border"
            >
              <h3 className="text-2xl font-bold mb-4">Remove Profile Picture?</h3>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
                Do you want to remove your profile picture? Your avatar will be shown instead.
              </p>
              <div className="flex gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={handleRemovePicture}
                    className="w-full"
                  >
                    Yes, Remove
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowRemoveModal(false)}
                    className="w-full"
                  >
                    No, Keep It
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
