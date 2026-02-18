import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Lock, AlertCircle, CheckCircle, Languages, AtSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navigation } from '../components/layout/Navigation';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    language: '',
    pin: '',
    confirmPin: '',
    role: 'farmer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if admin exists
  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-admin');
      const data = await response.json();
      setAdminExists(data.adminExists);
      if (data.adminExists) {
        setFormData((prev) => ({ ...prev, role: 'farmer' }));
      }
    } catch (error) {
      console.error('Error checking admin:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City/Area is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.language.trim()) {
      newErrors.language = 'Language is required';
    }

    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (!/^[0-9]{6}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be 6 digits';
    }

    if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({
      name: '',
      username: '',
      phoneNumber: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      language: '',
      pin: '',
      confirmPin: '',
      role: adminExists ? 'farmer' : formData.role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Registration failed' });
        clearForm();
        return;
      }

      // Show success message
      setSuccessMessage('Registration successful! Redirecting to login...');
      clearForm();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      clearForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 dark:from-saffron/5 dark:via-dark-background dark:to-green/5 flex items-center justify-center p-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          {/* Card */}
          <div className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl p-8 border border-light-border dark:border-dark-border">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src="/images/Niti_Setu_Logo.png"
                  alt="Niti-Setu Logo"
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h1 className="text-3xl font-sans font-bold mb-2 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                Join Niti-Setu to discover government schemes
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{errors.general}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Selection - Only show if admin doesn't exist */}
              {!adminExists && (
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Select Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'admin'
                          ? 'border-saffron bg-saffron/10 dark:bg-saffron/20'
                          : 'border-light-border dark:border-dark-border hover:border-saffron/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.role === 'admin' && (
                          <CheckCircle className="w-5 h-5 text-saffron" />
                        )}
                        <span className="font-medium">Admin</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'farmer' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === 'farmer'
                          ? 'border-green bg-green/10 dark:bg-green/20'
                          : 'border-light-border dark:border-dark-border hover:border-green/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.role === 'farmer' && (
                          <CheckCircle className="w-5 h-5 text-green" />
                        )}
                        <span className="font-medium">Farmer</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.name
                          ? 'border-red-500'
                          : 'border-light-border dark:border-dark-border'
                      } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })
                      }
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.username
                          ? 'border-red-500'
                          : 'border-light-border dark:border-dark-border'
                      } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                      placeholder="Choose a unique username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                      })
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.phoneNumber
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* City/Area */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City / Area
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.city
                          ? 'border-red-500'
                          : 'border-light-border dark:border-dark-border'
                      } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                      placeholder="Your city or area"
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium mb-2">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.district
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="Your district"
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.district}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.state
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="Your state"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      })
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pincode
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.language
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="Enter your native/preferred language"
                  />
                </div>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.language}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    6-Digit PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                    <input
                      type="password"
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pin: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.pin
                          ? 'border-red-500'
                          : 'border-light-border dark:border-dark-border'
                      } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                      placeholder="Create 6-digit PIN"
                      maxLength={6}
                    />
                  </div>
                  {errors.pin && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.pin}
                    </p>
                  )}
                </div>

                {/* Confirm PIN */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                    <input
                      type="password"
                      value={formData.confirmPin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        errors.confirmPin
                          ? 'border-red-500'
                          : 'border-light-border dark:border-dark-border'
                      } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                      placeholder="Confirm 6-digit PIN"
                      maxLength={6}
                    />
                  </div>
                  {errors.confirmPin && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPin}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>

              {/* Switch to Login */}
              <p className="text-center text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-saffron hover:text-saffron-dark font-medium transition-colors"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
