import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, MapPin, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (data: any) => void;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'farmer',
    password: '',
    confirmPassword: '',
    city: '',
    nativeLanguage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Check if admin exists
  useEffect(() => {
    if (isOpen) {
      checkAdminExists();
    }
  }, [isOpen]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 10,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
    });
  }, [formData.password]);

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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.nativeLanguage.trim()) {
      newErrors.nativeLanguage = 'Native language is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

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
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onRegisterSuccess(data);
      onClose();
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl bg-white dark:bg-dark-background rounded-2xl shadow-2xl p-8 my-8"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-light-muted dark:hover:bg-dark-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-sans font-bold mb-2">
                  Create Account
                </h2>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                  Join Niti-Setu to discover government schemes
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.general}</span>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                          errors.username
                            ? 'border-red-500'
                            : 'border-light-border dark:border-dark-border'
                        } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                        placeholder="Choose a username"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                          errors.email
                            ? 'border-red-500'
                            : 'border-light-border dark:border-dark-border'
                        } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role - Hidden if admin exists */}
                {!adminExists && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                          errors.password
                            ? 'border-red-500'
                            : 'border-light-border dark:border-dark-border'
                        } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                        placeholder="Strong password"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                          errors.confirmPassword
                            ? 'border-red-500'
                            : 'border-light-border dark:border-dark-border'
                        } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium mb-2">Password Requirements:</p>
                    {Object.entries({
                      hasMinLength: 'At least 10 characters',
                      hasUppercase: 'One uppercase letter',
                      hasLowercase: 'One lowercase letter',
                      hasNumber: 'One number',
                      hasSpecial: 'One special character (@$!%*?&)',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {passwordStrength[key as keyof typeof passwordStrength] ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={
                            passwordStrength[key as keyof typeof passwordStrength]
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-light-muted-foreground dark:text-dark-muted-foreground'
                          }
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
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
                        placeholder="Your city"
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* Native Language */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Native Language
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                      <input
                        type="text"
                        value={formData.nativeLanguage}
                        onChange={(e) =>
                          setFormData({ ...formData, nativeLanguage: e.target.value })
                        }
                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                          errors.nativeLanguage
                            ? 'border-red-500'
                            : 'border-light-border dark:border-dark-border'
                        } bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron transition-all`}
                        placeholder="e.g., Hindi, English"
                      />
                    </div>
                    {errors.nativeLanguage && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.nativeLanguage}
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
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-saffron hover:text-saffron-dark font-medium transition-colors"
                  >
                    Login
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
