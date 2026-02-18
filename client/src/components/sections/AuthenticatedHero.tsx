import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export function AuthenticatedHero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-saffron/5 via-white to-green/5 dark:from-saffron/10 dark:via-dark-background dark:to-green/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6">
              <span className="bg-gradient-to-r from-saffron via-orange-500 to-green bg-clip-text text-transparent">
                Check Your Eligibility
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-light-muted-foreground dark:text-dark-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover government schemes you qualify for using our voice-powered eligibility checker. 
              Simply speak your details and let our AI match you with the right schemes.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-dark-background rounded-xl p-6 shadow-lg border border-light-border dark:border-dark-border">
              <Mic className="w-12 h-12 text-saffron mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Voice Input</h3>
              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                Speak naturally in your preferred language
              </p>
            </div>
            <div className="bg-white dark:bg-dark-background rounded-xl p-6 shadow-lg border border-light-border dark:border-dark-border">
              <CheckCircle className="w-12 h-12 text-green mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                AI-powered scheme recommendations
              </p>
            </div>
            <div className="bg-white dark:bg-dark-background rounded-xl p-6 shadow-lg border border-light-border dark:border-dark-border">
              <FileText className="w-12 h-12 text-saffron mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                Get eligible schemes in seconds
              </p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate('/check-eligibility')}
              className="text-xl px-12 py-6"
            >
              <Mic className="w-6 h-6 mr-3" />
              Check Eligibility Now
            </Button>
            <p className="mt-4 text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
              No registration required • Works in multiple languages
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
