import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';

export function SupportPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

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
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-sans font-bold mb-4 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                Support Center
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                We're here to help you. Reach out to us through any of these channels.
              </p>
            </div>

            {/* Support Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Phone Support */}
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-saffron to-green rounded-full flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Phone Support</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                  Call us for immediate assistance
                </p>
                <a
                  href="tel:1800-XXX-XXXX"
                  className="text-saffron hover:text-saffron-dark font-semibold text-lg"
                >
                  1800-XXX-XXXX
                </a>
                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-2">
                  Available: Mon-Sat, 9 AM - 6 PM
                </p>
              </div>

              {/* Email Support */}
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green to-saffron rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Email Support</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                  Send us your queries via email
                </p>
                <a
                  href="mailto:support@nitisetu.gov.in"
                  className="text-green hover:text-green-dark font-semibold text-lg"
                >
                  support@nitisetu.gov.in
                </a>
                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-2">
                  Response within 24 hours
                </p>
              </div>

              {/* WhatsApp Support */}
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-saffron to-green rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">WhatsApp Support</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                  Chat with us on WhatsApp
                </p>
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-saffron hover:text-saffron-dark font-semibold text-lg"
                >
                  +91 XXXXX-XXXXX
                </a>
                <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-2">
                  Quick responses during business hours
                </p>
              </div>

              {/* Office Address */}
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green to-saffron rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Visit Us</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                  Our office address
                </p>
                <address className="not-italic text-light-foreground dark:text-dark-foreground">
                  Niti-Setu Office<br />
                  Government Building<br />
                  New Delhi - 110001<br />
                  India
                </address>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-saffron/10 to-green/10 rounded-2xl p-8 border border-light-border dark:border-dark-border">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                Before contacting support, you might find answers in our{' '}
                <a href="/faqs" className="text-saffron hover:text-saffron-dark font-semibold">
                  Frequently Asked Questions
                </a>{' '}
                section.
              </p>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                For feedback and suggestions, please use our{' '}
                <a href="/feedback" className="text-green hover:text-green-dark font-semibold">
                  Feedback
                </a>{' '}
                page.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
