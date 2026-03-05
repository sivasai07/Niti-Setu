import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navigation } from '../components/layout/Navigation';

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrPhone: '',
    pin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.usernameOrPhone.trim()) {
      newErrors.usernameOrPhone = 'Username or phone number is required';
    }

    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (!/^[0-9]{6}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({
      usernameOrPhone: '',
      pin: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Login failed' });
        clearForm();
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show success message
      setSuccessMessage('Login successful! Redirecting to home...');

      // Navigate to home after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
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
      <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10 dark:from-saffron/5 dark:via-dark-background dark:to-green/5 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
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
                Welcome Back
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                Login to your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    </motion.div>
                    <span className="font-semibold text-sm">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    </motion.div>
                    <span className="font-semibold text-sm">{errors.general}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username or Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username or Phone Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                  <input
                    type="text"
                    value={formData.usernameOrPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, usernameOrPhone: e.target.value.trim() })
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.usernameOrPhone
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="Enter username or phone number"
                  />
                </div>
                {errors.usernameOrPhone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.usernameOrPhone}
                  </p>
                )}
              </div>

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
                      setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      errors.pin
                        ? 'border-red-500'
                        : 'border-light-border dark:border-dark-border'
                    } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                  />
                </div>
                {errors.pin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.pin}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              {/* Switch to Register */}
              <p className="text-center text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-saffron hover:text-saffron-dark font-medium transition-colors"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
