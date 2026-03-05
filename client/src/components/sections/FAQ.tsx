import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Niti-Setu and how does it help farmers?',
    answer: 'Niti-Setu is an AI-powered platform that helps farmers discover government schemes they are eligible for. Using voice technology and simple forms, we make it easy to check eligibility and access benefits in just 10 seconds.',
  },
  {
    question: 'How do I check my eligibility for government schemes?',
    answer: 'Simply click on "Check Eligibility" and either use voice input to describe your situation or fill out a simple form with your details. Our AI will instantly analyze your information and show you all the schemes you qualify for.',
  },
  {
    question: 'Is my personal information safe and secure?',
    answer: 'Absolutely. We take data security very seriously. All your information is encrypted and stored securely. We never share your personal data with third parties without your consent.',
  },
  {
    question: 'Do I need to create an account to use Niti-Setu?',
    answer: 'You can check eligibility without an account, but creating a free account allows you to save your results, track your application history, and receive updates about new schemes.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContactSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <section
      id="faq"
      className="relative py-16 lg:py-20 bg-gradient-to-br from-light-background via-light-muted/30 to-light-background dark:bg-gradient-to-br dark:from-dark-background dark:via-dark-muted/30 dark:to-dark-background overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-saffron/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-saffron bg-saffron/10 rounded-full"
          >
            Got Questions?
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Niti-Setu
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div
                className={`bg-white dark:bg-dark-muted rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  openIndex === index
                    ? 'border-saffron dark:border-saffron-light'
                    : 'border-transparent hover:border-saffron/30 dark:hover:border-saffron-light/30'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors"
                >
                  <h3 className="text-lg font-semibold text-light-foreground dark:text-dark-foreground pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    {openIndex === index ? (
                      <Minus className="w-6 h-6 text-saffron" />
                    ) : (
                      <Plus className="w-6 h-6 text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-saffron transition-colors" />
                    )}
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-light-muted-foreground dark:text-dark-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
            Still have questions?
          </p>
          <button
            onClick={handleContactSupport}
            className="inline-block px-8 py-3 bg-gradient-to-r from-saffron to-orange-600 hover:from-saffron-dark hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Contact Support
          </button>
        </motion.div>
      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tricolor Borders */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-white to-green"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-white to-green"></div>
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-saffron via-white to-green"></div>
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-saffron via-white to-green"></div>

              <div className="text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-saffron to-orange-600">
                  <span className="text-3xl">🔒</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-dark-foreground">
                  Login Required
                </h3>
                
                {/* Message */}
                <p className="text-gray-700 dark:text-dark-muted-foreground mb-6">
                  Please login to contact our support team. Create a free account or sign in to get personalized assistance.
                </p>

                {/* Buttons */}
                <div className="flex gap-4 mb-6">
                  <a
                    href="/login"
                    className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-saffron to-orange-600 hover:from-saffron-dark hover:to-orange-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center"
                    style={{ color: '#FFFFFF' }}
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="flex-1 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center"
                    style={{ color: '#FFFFFF' }}
                  >
                    Register
                  </a>
                </div>

                {/* Social Media Links */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm text-gray-600 dark:text-dark-muted-foreground mb-4">
                    Follow us on social media
                  </p>
                  <div className="flex justify-center gap-4">
                    <a
                      href="https://www.linkedin.com/company/agrigoi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-110"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a
                      href="https://x.com/AgriGoI/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Twitter/X"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/agriGoI/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/agrigoi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center transition-all hover:scale-110"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
