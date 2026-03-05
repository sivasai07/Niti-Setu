import { motion } from 'framer-motion';
import { Mic, FileSearch, CheckCircle, Rocket } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Speak or Type',
    description:
      'Tell us about your farm, land size, and location in your own language',
    icon: <Mic className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 2,
    title: 'AI Reads Official PDFs',
    description:
      'Our AI scans government scheme documents and finds relevant information',
    icon: <FileSearch className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 3,
    title: 'Get Results with Proof',
    description:
      'Receive eligibility results with exact page and paragraph citations',
    icon: <span className="text-5xl">✅</span>,
    color: 'from-green-600 to-green-700',
  },
  {
    id: 4,
    title: 'Apply Instantly',
    description:
      'Direct links to application portals with all required document lists',
    icon: <Rocket className="w-10 h-10" style={{ color: 'white' }} strokeWidth={2.5} />,
    color: 'from-orange-500 to-orange-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const stepVariants = {
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

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-12 lg:py-16 bg-gradient-to-br from-light-muted/30 via-white to-light-muted/30 dark:bg-gradient-to-br dark:from-dark-muted dark:via-dark-background dark:to-dark-muted overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground max-w-2xl mx-auto">
            From question to answer in just 10 seconds
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Connection Line */}
          <div className="hidden md:block absolute top-16 left-24 right-24 h-1 bg-gradient-to-r from-orange-500 via-blue-500 via-green-600 to-orange-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.div
      variants={stepVariants}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="group relative text-center"
    >
      {/* Hover glow effect */}
      <motion.div
        className={`absolute -inset-4 bg-gradient-to-br ${step.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 + index * 0.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`relative inline-flex items-center justify-center w-24 h-24 mb-4 rounded-3xl bg-gradient-to-br ${step.color} shadow-xl group-hover:shadow-2xl mx-auto transition-shadow duration-300`}
      >
        {step.icon}
      </motion.div>

      {/* Step Label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.2 }}
        className="text-xs font-semibold text-gray-400 dark:text-gray-500 group-hover:text-saffron dark:group-hover:text-saffron-light mb-2 uppercase tracking-wider transition-colors duration-300"
      >
        Step {step.id}
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2 text-light-foreground dark:text-dark-foreground group-hover:text-saffron dark:group-hover:text-saffron-light transition-colors duration-300">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-base text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-light-foreground dark:group-hover:text-dark-foreground leading-relaxed px-2 transition-colors duration-300">
        {step.description}
      </p>
    </motion.div>
  );
}
