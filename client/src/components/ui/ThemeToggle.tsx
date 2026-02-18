import { useTheme } from '../providers/ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative group">
      <motion.button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg hover:bg-light-muted dark:hover:bg-dark-muted transition-colors"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === 'dark' ? 0 : 180,
            scale: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl">☀️</span>
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            rotate: theme === 'light' ? 0 : -180,
            scale: theme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <span className="text-2xl">🌙</span>
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-light-foreground dark:bg-dark-foreground text-white dark:text-dark-background text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
        <div className="absolute -top-1 right-4 w-2 h-2 bg-light-foreground dark:bg-dark-foreground rotate-45" />
      </div>
    </div>
  );
}
