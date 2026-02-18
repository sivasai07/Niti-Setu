import { motion } from 'framer-motion';
import { Target, Users, Zap, Shield } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

const highlights = [
  {
    icon: <Target className="w-6 h-6" />,
    text: 'Accurate Matching',
  },
  {
    icon: <Users className="w-6 h-6" />,
    text: 'User-Friendly',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    text: 'Instant Results',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    text: 'Secure & Private',
  },
];

function StatCounter({
  value,
  suffix = '',
  label,
  delay,
  format = 'normal',
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
  format?: 'normal' | 'compact';
}) {
  const { count, ref } = useCountUp(value, 2000);

  const formatNumber = (num: number) => {
    if (format === 'compact' && num >= 100000) {
      return `${(num / 100000).toFixed(0)}L`;
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1 + delay, type: 'spring', stiffness: 200 }}
      className="group"
    >
      <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
        <div className="text-4xl sm:text-5xl font-display font-bold gradient-text mb-2">
          {formatNumber(count)}
          {suffix}
        </div>
        <div className="text-sm sm:text-base text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-light-foreground dark:group-hover:text-dark-foreground transition-colors">
          {label}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="relative py-12 lg:py-16 bg-light-background dark:bg-dark-background overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-saffron/10 via-green/10 to-saffron/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            About Niti-Setu
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Bridging Citizens with{' '}
            <span className="gradient-text">Government Schemes</span>
          </h2>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center space-y-6 mb-16"
        >
          <p className="text-lg sm:text-xl text-light-foreground dark:text-dark-foreground leading-relaxed">
            Niti-Setu is an innovative voice-based platform designed to simplify
            access to government schemes for every Indian citizen. Using advanced
            AI technology, we analyze your profile and match you with eligible
            schemes instantly.
          </p>
          <p className="text-base sm:text-lg text-light-muted-foreground dark:text-dark-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Our mission is to ensure that no eligible citizen misses out on
            government benefits due to lack of awareness or complex application
            processes. With Niti-Setu, discovering and applying for schemes is as
            simple as having a conversation.
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.text}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.08, y: -8 }}
              className="group relative"
            >
              {/* Hover glow effect */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-saffron/20 to-green/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <div className="relative bg-white dark:bg-dark-muted rounded-xl p-6 shadow-md group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-saffron/30 dark:group-hover:border-green/30">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-saffron/20 to-green/20 text-saffron dark:text-saffron-light group-hover:from-saffron/30 group-hover:to-green/30 transition-all duration-300"
                >
                  {highlight.icon}
                </motion.div>

                {/* Text */}
                <p className="text-sm font-semibold text-light-foreground dark:text-dark-foreground group-hover:text-saffron dark:group-hover:text-saffron-light transition-colors">
                  {highlight.text}
                </p>

                {/* Bottom glow */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-gradient-to-r from-saffron/30 to-green/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section with Counter Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 text-center"
        >
          <StatCounter value={500} suffix="+" label="Government Schemes" delay={0} />
          <StatCounter value={1000000} suffix="+" label="Users Helped" delay={0.1} format="compact" />
          <StatCounter value={15} suffix="+" label="Languages Supported" delay={0.2} />
        </motion.div>
      </div>
    </section>
  );
}
