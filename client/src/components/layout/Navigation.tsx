import { useState, useEffect } from 'react';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { useScrollSpy } from '../../hooks/useScrollSpy';

interface NavLink {
  label: string;
  href: string;
}

const publicNavLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Schemes', href: '#schemes' },
  { label: 'About', href: '#about' },
  { label: 'Stories', href: '#stories' },
];

const farmerNavLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'Support', href: '/support' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'FAQs', href: '/faqs' },
];

const adminNavLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Users', href: '/users' },
  { label: 'Stories', href: '/stories' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'FAQs', href: '/faqs' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const activeSection = useScrollSpy(['home', 'how-it-works', 'schemes', 'about', 'stories'], 150);

  const isHomePage = location.pathname === '/';
  
  // Determine which nav links to show based on user role
  const getNavLinks = () => {
    if (!user) return publicNavLinks;
    return user.role === 'admin' ? adminNavLinks : farmerNavLinks;
  };
  
  const navLinks = getNavLinks();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for user updates (when profile is updated)
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // If it's a route (starts with /), navigate to it
    if (href.startsWith('/')) {
      navigate(href);
      setIsMobileMenuOpen(false);
      return;
    }
    
    // If it's a hash link and we're not on home page, go to home first
    if (href.startsWith('#') && location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const sectionId = href.replace('#', '');
        const section = document.getElementById(sectionId);
        if (section) {
          const offset = 80;
          const sectionTop = section.offsetTop - offset;
          window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
      }, 100);
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Handle hash navigation on home page
    const sectionId = href.replace('#', '');
    const section = document.getElementById(sectionId);
    
    if (section) {
      const offset = 80;
      const sectionTop = section.offsetTop - offset;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
    
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href.startsWith('/')) {
      return location.pathname === href;
    }
    const sectionId = href.replace('#', '');
    return activeSection === sectionId && location.pathname === '/';
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setIsProfileDropdownOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    setShowLogoutSuccess(true);
    
    // Navigate to landing page and force reload to clear all state
    setTimeout(() => {
      setShowLogoutSuccess(false);
      window.location.href = '/';
    }, 2000);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-dark-background/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/images/Niti_Setu_Logo.png"
              alt="Niti-Setu Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-display font-bold bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
              Niti-Setu
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative group"
              >
                <span
                  className={`text-base font-medium transition-colors duration-300 ${
                    isActive(link.href)
                      ? 'text-saffron dark:text-saffron-light'
                      : 'text-light-foreground dark:text-dark-foreground hover:text-saffron dark:hover:text-saffron-light'
                  }`}
                >
                  {link.label}
                </span>
                {/* Animated underline */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-saffron to-green"
                  initial={{ width: 0 }}
                  animate={{
                    width: isActive(link.href) ? '100%' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Hover underline */}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-saffron to-green group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-light-muted dark:hover:bg-dark-muted transition-colors"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gradient-to-r from-saffron to-green"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-background rounded-lg shadow-xl border border-light-border dark:border-dark-border overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-light-border dark:border-dark-border">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                          {user.role === 'admin' ? 'Administrator' : 'Farmer'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-light-muted dark:hover:bg-dark-muted transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/history');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-light-muted dark:hover:bg-dark-muted transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-light-muted dark:hover:bg-dark-muted transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="gradient"
                size="md"
                onClick={() => navigate('/login')}
                className="min-w-[100px]"
              >
                Login
              </Button>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-light-muted dark:hover:bg-dark-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-light-foreground dark:text-dark-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-light-foreground dark:text-dark-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 dark:bg-dark-background/95 backdrop-blur-lg border-t border-light-border dark:border-dark-border"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block py-2 text-lg font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-saffron dark:text-saffron-light'
                      : 'text-light-foreground dark:text-dark-foreground hover:text-saffron dark:hover:text-saffron-light'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-light-muted dark:bg-dark-muted rounded-lg">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gradient-to-r from-saffron to-green"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                          {user.role === 'admin' ? 'Administrator' : 'Farmer'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        navigate('/history');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      History
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleLogout}
                      className="w-full text-red-600 dark:text-red-400 border-red-600 dark:border-red-400"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Logout Confirmation</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
                  Are you sure you want to logout?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-6 py-3 bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Success Message */}
      <AnimatePresence>
        {showLogoutSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-orange-600 dark:bg-orange-500 text-white px-10 py-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 border-4 border-orange-700 dark:border-orange-600"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-xl">Logout Successful!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
