import { motion } from 'framer-motion';
import { Sun, Building2, Banknote } from 'lucide-react';

interface Scheme {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  gradient: string;
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
  },
  {
    id: 'pm-kusum',
    title: 'PM-KUSUM',
    description:
      '70% Subsidy on Solar Pumps',
    icon: <Sun className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    benefits: ['70% Subsidy'],
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    id: 'agri-infra',
    title: 'Agri Infrastructure Fund',
    description:
      '3% Interest Subvention',
    icon: <Building2 className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    benefits: ['3% Discount'],
    gradient: 'from-blue-500 to-blue-600',
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
            <SchemeCard key={scheme.id} scheme={scheme} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
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
      <div className="relative h-full bg-white dark:bg-dark-muted rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 text-center border border-transparent group-hover:border-saffron/20 dark:group-hover:border-green/20">
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

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${scheme.gradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}
