import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Building2, X } from 'lucide-react';
import { useState } from 'react';

interface Scheme {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  gradient: string;
  buttonColor: string;
  officialLink: string;
}

const schemes: Scheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN',
    description:
      'Income support for small & marginal farmers',
    icon: <span className="text-5xl">💰</span>,
    benefits: ['₹6,000/year'],
    gradient: 'from-green-600 to-green-700',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    officialLink: 'https://pmkisan.gov.in',
  },
  {
    id: 'pm-kusum',
    title: 'PM-KUSUM',
    description:
      '70% Subsidy on Solar Pumps',
    icon: <Sun className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    benefits: ['70% Subsidy'],
    gradient: 'from-orange-500 to-orange-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    officialLink: 'https://mnre.gov.in/en/pradhan-mantri-kisan-urja-suraksha-evam-utthaan-mahabhiyaan-pm-kusum/',
  },
  {
    id: 'agri-infra',
    title: 'Agri Infrastructure Fund',
    description:
      '3% Interest Subvention',
    icon: <Building2 className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    benefits: ['3% Discount'],
    gradient: 'from-blue-500 to-blue-600',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    officialLink: 'https://agriinfra.dac.gov.in/',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export function Schemes() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const handleViewDetails = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setShowConfirmModal(true);
  };

  const confirmVisit = () => {
    if (selectedScheme) {
      window.open(selectedScheme.officialLink, '_blank', 'noopener,noreferrer');
    }
    setShowConfirmModal(false);
    setSelectedScheme(null);
  };

  const cancelVisit = () => {
    setShowConfirmModal(false);
    setSelectedScheme(null);
  };

  return (
    <section
      id="schemes"
      className="relative py-12 lg:py-16 bg-gradient-to-br from-light-muted/30 via-light-background to-light-muted/30 dark:bg-gradient-to-br dark:from-dark-muted dark:via-dark-background dark:to-dark-muted overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
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
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-saffron bg-saffron/10 rounded-full"
          >
            Popular Schemes
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Explore Government{' '}
            <span className="gradient-text">Schemes</span>
          </h2>
          <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground max-w-2xl mx-auto">
            Find out which of these schemes you qualify for
          </p>
        </motion.div>

        {/* Schemes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {schemes.map((scheme, index) => (
            <SchemeCard key={scheme.id} scheme={scheme} index={index} onViewDetails={handleViewDetails} />
          ))}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={cancelVisit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-50 dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={cancelVisit}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-muted hover:bg-gray-300 dark:hover:bg-dark-border flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>

              <div className="text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-xl bg-gradient-to-br ${selectedScheme.gradient} shadow-lg`}>
                  {selectedScheme.icon}
                </div>

                {/* Scheme Title */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-dark-foreground">
                  {selectedScheme.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-700 dark:text-dark-muted-foreground mb-4">
                  {selectedScheme.description}
                </p>

                {/* Benefits */}
                <div className="text-3xl font-bold mb-6 text-orange-600 dark:text-saffron">
                  {selectedScheme.benefits[0]}
                </div>

                {/* Message */}
                <p className="text-gray-700 dark:text-dark-muted-foreground mb-2 font-medium">
                  Do you want to visit the official website for more details?
                </p>
                
                {/* Official Link */}
                <p className="text-blue-600 dark:text-blue-400 break-all text-sm mb-6">
                  {selectedScheme.officialLink}
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={cancelVisit}
                    className="flex-1 py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    style={{ color: '#FFFFFF' }}
                  >
                    No
                  </button>
                  <button
                    onClick={confirmVisit}
                    className="flex-1 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    style={{ color: '#FFFFFF' }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Old Modal - REMOVED */}
      {/* Modal for Scheme Details */}
      <AnimatePresence>
        {false && selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedScheme(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-50 dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedScheme(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-muted hover:bg-gray-300 dark:hover:bg-dark-border flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>

              <div className="text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-xl bg-gradient-to-br ${selectedScheme.gradient} shadow-lg`}>
                  {selectedScheme.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-dark-foreground">{selectedScheme.title}</h3>
                
                {/* Description */}
                <p className="text-gray-700 dark:text-dark-muted-foreground mb-4">
                  {selectedScheme.description}
                </p>

                {/* Benefits */}
                <div className="text-3xl font-bold mb-6 text-orange-600 dark:text-saffron">
                  {selectedScheme.benefits[0]}
                </div>

                {/* Official Link */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-dark-foreground">Official Website:</p>
                  <p className="text-blue-600 dark:text-blue-400 break-all text-sm">
                    {selectedScheme.officialLink}
                  </p>
                </div>

                {/* Visit Button */}
                <button
                  onClick={() => handleVisitWebsite(selectedScheme.officialLink)}
                  className={`block w-full py-3 px-6 rounded-lg ${selectedScheme.buttonColor} text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center`}
                  style={{ color: '#FFFFFF' }}
                >
                  Visit Official Website
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SchemeCard({ scheme, index, onViewDetails }: { scheme: Scheme; index: number; onViewDetails: (scheme: Scheme) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-saffron/20 via-green/20 to-saffron/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Card content */}
      <div className="relative h-full bg-white dark:bg-dark-muted rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 text-center border border-transparent group-hover:border-saffron/20 dark:group-hover:border-green/20 flex flex-col">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.15 }}
          transition={{ duration: 0.6 }}
          className={`relative inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${scheme.gradient} shadow-lg group-hover:shadow-2xl mx-auto`}
        >
          {scheme.icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-light-foreground dark:text-dark-foreground group-hover:text-saffron dark:group-hover:text-saffron-light transition-colors duration-300">
          {scheme.title}
        </h3>

        {/* Description */}
        <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-6 group-hover:text-light-foreground dark:group-hover:text-dark-foreground transition-colors duration-300">
          {scheme.description}
        </p>

        {/* Benefits */}
        <div className="text-3xl font-bold mb-6 text-light-foreground dark:text-dark-foreground group-hover:scale-110 transition-transform duration-300">
          {scheme.benefits[0]}
        </div>

        {/* CTA Button - Push to bottom */}
        <div className="mt-auto">
          <motion.button
            onClick={() => onViewDetails(scheme)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ color: '#FFFFFF' }}
            className={`w-full py-3 px-6 rounded-lg ${scheme.buttonColor} font-semibold shadow-lg hover:shadow-xl transition-all`}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
