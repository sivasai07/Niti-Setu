import { motion } from 'framer-motion';
import { CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

export function ProofCard() {
  return (
    <section
      id="proof-card"
      className="relative py-20 lg:py-32 bg-gradient-to-br from-green/5 via-white to-saffron/5 dark:from-green/10 dark:via-dark-background dark:to-saffron/10 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-saffron/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
            Want like <span className="gradient-text">this?</span>
          </h2>
          <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground max-w-2xl mx-auto">
            Get detailed eligibility results with proof from official documents
          </p>
        </motion.div>

        {/* Proof Card Example */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ y: -8, scale: 1.01 }}
          className="max-w-4xl mx-auto group relative"
        >
          {/* Hover glow effect */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />

          <div className="relative bg-white dark:bg-dark-muted rounded-3xl shadow-2xl group-hover:shadow-3xl overflow-hidden border-2 border-green-500/20 group-hover:border-green-500/40 transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 rounded-full"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-bold text-green-700 dark:text-green-300">Eligible</span>
                </motion.div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">PM-KISAN</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Amount */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="text-5xl font-bold text-light-foreground dark:text-dark-foreground mb-2">
                  ₹6,000
                </div>
                <div className="text-gray-600 dark:text-gray-400">per year</div>
              </motion.div>

              {/* Proof Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 mb-6 border border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-semibold">Page 4, Para 3:</span> "All farmers with landholding less than 2 hectares are eligible..."
                    </p>
                    <button className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1">
                      Show Full Proof →
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Required Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <h3 className="font-bold text-lg mb-4 text-light-foreground dark:text-dark-foreground">
                  Required Documents:
                </h3>
                <div className="space-y-3">
                  {['Aadhaar Card', 'Land Records', 'Address Proof'].map((doc, index) => (
                    <motion.div
                      key={doc}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Apply Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Apply Now
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* CTA Below Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="text-center mt-12"
          >
            <p className="text-xl text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
              Check your eligibility for 100+ government schemes in seconds
            </p>
            <Button
              variant="gradient"
              size="lg"
              href="#check-eligibility"
              className="group"
            >
              <span className="flex items-center gap-2">
                Check Your Eligibility Now
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
