import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import { Button } from './Button';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginPromptModal({ isOpen, onClose, onLogin }: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white dark:bg-dark-background rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-light-muted dark:hover:bg-dark-muted transition-colors group"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-light-foreground dark:group-hover:text-dark-foreground transition-colors" />
              </button>

              {/* Content */}
              <div className="p-8 pt-12">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center"
                >
                  <LogIn className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent"
                >
                  Login Required
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-light-muted-foreground dark:text-dark-muted-foreground mb-8"
                >
                  Please login to check your eligibility for government schemes
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={onLogin}
                    className="flex-1 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Login
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Not Now
                  </Button>
                </motion.div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-white to-green" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
