import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoginPromptModal } from '../ui/LoginPromptModal';

const trustPoints = [
  'Government Verified Schemes',
  'Voice-Enabled Assistance',
  'Instant Eligibility Check',
];

export function Hero() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleCheckEligibility = () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (user) {
      // User is logged in, navigate to check eligibility page
      navigate('/check-eligibility');
    } else {
      // User is not logged in, show login prompt modal
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginFromModal = () => {
    setIsLoginModalOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginFromModal}
      />

      <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-saffron/5 via-white to-green/5 dark:from-saffron/10 dark:via-dark-background dark:to-green/10 pt-16 -mt-8"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-saffron/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-green/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8 lg:col-span-2"
          >
            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
              >
                Discover{' '}
                <span className="gradient-text">Government Schemes</span>{' '}
                with Your Voice
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-light-muted-foreground dark:text-dark-muted-foreground max-w-xl"
              >
                Niti-Setu makes it easy to find and apply for government schemes
                through intelligent voice interaction. Check your eligibility in
                seconds.
              </motion.p>
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={handleCheckEligibility}
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Check Eligibility
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                {/* Ripple effect */}
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0.5 }}
                  whileHover={{
                    scale: 2,
                    opacity: 0,
                    transition: { duration: 0.6 },
                  }}
                />
              </Button>

              <Button
                variant="outline"
                size="lg"
                href="#demo"
                className="group relative overflow-hidden"
              >
                <span className="relative z-10">Watch Demo</span>
                {/* 3D lift effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-saffron/10 to-green/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ y: -2 }}
                />
              </Button>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-3 pt-4"
            >
              {trustPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-light-foreground dark:text-dark-foreground font-medium group-hover:text-saffron dark:group-hover:text-saffron-light transition-colors">
                    {point}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image with Enhanced Animations */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="relative lg:col-span-3 -mt-12"
          >
            {/* Animated gradient rings */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, rgba(255, 153, 51, 0.3), transparent, rgba(19, 136, 8, 0.3), transparent)',
                filter: 'blur(40px)',
              }}
            />

            <motion.div
              animate={{
                y: [0, -20, 0],
                rotateY: [0, 5, 0],
                rotateX: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              {/* Pulsing glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-saffron/40 to-green/40 blur-3xl rounded-full"
              />

              {/* Image container with 3D effect */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 },
                }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Shine effect overlay */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 z-10"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'skewX(-20deg)',
                  }}
                />

                <motion.img
                  src="/images/nitisetu_ind_dashboard.png"
                  alt="Niti-Setu dashboard showing government schemes and eligibility checker"
                  className="w-full h-auto object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02 }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3ENiti-Setu Dashboard%3C/text%3E%3C/svg%3E';
                  }}
                />

                {/* Border glow effect */}
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow:
                      'inset 0 0 20px rgba(255, 153, 51, 0.3), inset 0 0 40px rgba(19, 136, 8, 0.2)',
                  }}
                />
              </motion.div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.sin(i) * 20, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-saffron to-green"
                  style={{
                    top: `${20 + i * 10}%`,
                    left: `${10 + i * 15}%`,
                  }}
                />
              ))}

              {/* Corner accents */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-saffron/30 to-transparent rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-green/30 to-transparent rounded-full blur-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-light-border dark:border-dark-border rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-saffron rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
    </>
  );
}
