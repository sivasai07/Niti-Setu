import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, MessageSquare, CheckCircle, TrendingUp, Activity, Server, Database, Zap, ArrowRight } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { AuthenticatedHero } from '../components/sections/AuthenticatedHero';
import { FarmerDashboard } from '../components/sections/FarmerDashboard';
import { Schemes } from '../components/sections/Schemes';
import { HowItWorks } from '../components/sections/HowItWorks';
import { Stories } from '../components/sections/Stories';
import { FAQ } from '../components/sections/FAQ';
import { About } from '../components/sections/About';

export function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Redirect admin to /admin page
      if (userData.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [navigate]);

  // If user is logged in as farmer, show farmer dashboard
  if (user && user.role === 'farmer') {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">{user.name}!</span>
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                Check your eligibility for government schemes
              </p>
            </motion.div>

            {/* Farmer Dashboard */}
            <FarmerDashboard user={user} />
          </div>
        </div>
      </div>
    );
  }

  // Public landing page (with footer)
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Schemes />
      <About />
      <Stories />
      <FAQ />
      <Footer />
    </div>
  );
}
