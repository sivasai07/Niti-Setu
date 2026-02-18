import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Stories } from '../components/sections/Stories';

export function StoriesPage() {
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
      
      <div className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-sans font-bold mb-4 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
              Success Stories
            </h1>
            <p className="text-xl text-light-muted-foreground dark:text-dark-muted-foreground max-w-3xl mx-auto">
              Real stories from farmers who have benefited from government schemes through Niti-Setu
            </p>
          </div>

          {/* Stories Section */}
          <Stories />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
