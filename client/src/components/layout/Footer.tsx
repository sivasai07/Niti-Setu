import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, X } from 'lucide-react';
import { useState } from 'react';

const footerLinks = {
  product: [
    { label: 'Features', href: '#schemes' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact', isModal: true },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy', isModal: true },
    { label: 'Terms of Service', href: '#terms', isModal: true },
    { label: 'Cookie Policy', href: '#cookies', isModal: true },
    { label: 'Disclaimer', href: '#disclaimer', isModal: true },
  ],
};

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, href: 'https://www.facebook.com/agriGoI/', label: 'Facebook' },
  { icon: <Twitter className="w-5 h-5" />, href: 'https://x.com/AgriGoI/', label: 'Twitter' },
  { icon: <Linkedin className="w-5 h-5" />, href: 'https://www.linkedin.com/company/agrigoi/', label: 'LinkedIn' },
  { icon: <Instagram className="w-5 h-5" />, href: 'https://www.instagram.com/agrigoi/', label: 'Instagram' },
];

const contactInfo = {
  email: 'support@niti-setu.gov.in',
  phone: '1800-180-1551',
  address: 'Ministry of Agriculture & Farmers Welfare, Krishi Bhawan, New Delhi - 110001, India',
  name: 'Niti-Setu',
};

export function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContactModal(true);
  };

  const handleLegalClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    setShowLegalModal(true);
    
    const legalContents: Record<string, { title: string; content: string }> = {
      'Privacy Policy': {
        title: 'Privacy Policy',
        content: 'At Niti-Setu, we are committed to protecting your privacy. We collect only necessary information to provide our services. Your personal data is encrypted and stored securely. We never share your information with third parties without your explicit consent. You have the right to access, modify, or delete your data at any time. For detailed information about how we handle your data, please contact our support team.',
      },
      'Terms of Service': {
        title: 'Terms of Service',
        content: 'By using Niti-Setu, you agree to our terms of service. Our platform is provided "as is" for informational purposes. While we strive for accuracy, we cannot guarantee that all scheme information is current or complete. Users are responsible for verifying eligibility criteria with official government sources. We reserve the right to modify or discontinue services at any time. Misuse of the platform may result in account suspension.',
      },
      'Cookie Policy': {
        title: 'Cookie Policy',
        content: 'Niti-Setu uses cookies to enhance your browsing experience. Cookies help us remember your preferences, language settings, and login status. We use both session cookies (temporary) and persistent cookies (stored on your device). You can control cookie settings through your browser. Disabling cookies may affect some features of our platform. We do not use cookies for advertising or tracking purposes.',
      },
      'Disclaimer': {
        title: 'Disclaimer',
        content: 'Niti-Setu is an informational platform designed to help citizens discover government schemes. We are not affiliated with any government department. The eligibility results provided are indicative and should be verified with official sources. We are not responsible for any decisions made based on information from our platform. Scheme details, eligibility criteria, and benefits may change without notice. Always refer to official government websites for the most current information.',
      },
    };
    
    setLegalContent(legalContents[label] || { title: label, content: 'Content coming soon.' });
  };

  return (
    <>
      <footer className="relative bg-gradient-to-r from-saffron to-green border-t border-saffron/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/Niti_Setu_Logo.png"
                    alt="Niti-Setu Logo"
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-2xl font-display font-bold text-white">
                    Niti-Setu
                  </span>
                </div>
                <p className="text-white/90 mb-6">
                  Empowering citizens with easy access to government schemes through
                  intelligent voice technology.
                </p>
              </motion.div>

              {/* Contact Info */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-base text-white/90 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 text-white" />
                  {contactInfo.email}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 text-base text-white/90 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 text-white" />
                  {contactInfo.phone}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 text-base text-white/90 hover:text-white transition-colors"
                >
                  <MapPin className="w-5 h-5 text-white" />
                  New Delhi, India
                </motion.div>
              </div>
            </div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-base font-semibold text-white uppercase tracking-wider mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.label === 'Contact') {
                            handleContactClick(e);
                          } else if (link.isModal && category === 'legal') {
                            handleLegalClick(e, link.label);
                          }
                        }}
                        className="text-base text-white/90 hover:text-saffron-light transition-colors cursor-pointer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-base text-white/90"
              >
                © {new Date().getFullYear()} Niti-Setu. All rights reserved.
              </motion.p>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-muted hover:bg-gray-300 dark:hover:bg-dark-border flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>

              <div className="text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-saffron to-orange-600">
                  <Phone className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-dark-foreground">
                  Contact Us
                </h3>

                {/* Contact Details */}
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-muted rounded-lg">
                    <Mail className="w-5 h-5 text-saffron mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-foreground mb-1">Email</p>
                      <a href={`mailto:${contactInfo.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-muted rounded-lg">
                    <Phone className="w-5 h-5 text-saffron mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-foreground mb-1">Helpline (Toll-Free)</p>
                      <a href={`tel:${contactInfo.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-muted rounded-lg">
                    <MapPin className="w-5 h-5 text-saffron mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-foreground mb-1">Address</p>
                      <p className="text-gray-700 dark:text-dark-muted-foreground text-sm">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-saffron/10 to-orange-600/10 rounded-lg border-2 border-saffron/20">
                    <div className="text-2xl">🌾</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-foreground mb-1">Platform</p>
                      <p className="text-gray-700 dark:text-dark-muted-foreground font-semibold">
                        {contactInfo.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLegalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLegalModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-muted hover:bg-gray-300 dark:hover:bg-dark-border flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-saffron to-orange-600 p-6">
                <h3 className="text-2xl font-bold text-white pr-8">
                  {legalContent.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <p className="text-gray-700 dark:text-dark-muted-foreground leading-relaxed whitespace-pre-line">
                  {legalContent.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
