import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileCheck, List, Clock, X, ArrowRight, CheckCircle, TrendingUp, MessageSquare, HelpCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FarmerDashboardProps {
  user: any;
}

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [showApplicableSchemesModal, setShowApplicableSchemesModal] = useState(false);
  const [eligibilityCount, setEligibilityCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [applicableSchemes, setApplicableSchemes] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch eligibility count
  useEffect(() => {
    const fetchEligibilityCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('History data:', data);
        
        if (data.success) {
          setEligibilityCount(data.history.length);
          setRecentActivity(data.history.slice(0, 5));
          
          // Extract unique applicable schemes from history outputData
          const uniqueSchemes = new Map();
          
          data.history.forEach((item: any, idx: number) => {
            console.log(`History item ${idx}:`, item);
            if (item.outputData && typeof item.outputData === 'object') {
              console.log(`OutputData for item ${idx}:`, item.outputData);
              
              // Check for summary field which contains recommended schemes
              if (item.outputData.summary && typeof item.outputData.summary === 'string') {
                console.log(`Summary: ${item.outputData.summary}`);
                
                // Extract scheme names from summary like "Recommended scheme: PM-KUSUM - Component_C"
                // Match everything after "Recommended scheme: " until " - " (including hyphens in scheme name)
                const summaryMatch = item.outputData.summary.match(/Recommended scheme:\s*([A-Z\-\s]+?)(?:\s*-\s*Component|$)/);
                if (summaryMatch && summaryMatch[1]) {
                  let recommendedSchemeName = summaryMatch[1].trim();
                  console.log(`Extracted recommended scheme: ${recommendedSchemeName}`);
                  
                  // Find the corresponding scheme data by looking for PM-KISAN, PM-KUSUM, or AIF
                  let schemeKey = null;
                  let schemeData = null;
                  
                  // Try to find exact match or partial match
                  if (item.outputData[recommendedSchemeName]) {
                    schemeKey = recommendedSchemeName;
                    schemeData = item.outputData[recommendedSchemeName];
                  } else {
                    // Try to find by checking all keys
                    Object.keys(item.outputData).forEach((key: string) => {
                      if (key.includes(recommendedSchemeName) || recommendedSchemeName.includes(key)) {
                        if (key !== 'summary' && key !== 'scheme_comparison' && key !== 'decision_explanation') {
                          schemeKey = key;
                          schemeData = item.outputData[key];
                        }
                      }
                    });
                  }
                  
                  if (schemeData && schemeKey) {
                    console.log(`Found scheme data for ${recommendedSchemeName}:`, schemeData);
                    
                    if (!uniqueSchemes.has(recommendedSchemeName)) {
                      console.log(`Adding recommended scheme: ${recommendedSchemeName}`);
                      
                      // Extract proofs from 'proof' field - extract document_name from proof objects
                      let proofsList = [];
                      if (Array.isArray(schemeData.proof)) {
                        proofsList = schemeData.proof.map((p: any) => {
                          if (typeof p === 'string') {
                            return p;
                          } else if (p && typeof p === 'object') {
                            // Extract document_name from proof object
                            return p.document_name || p.name || p.description || '';
                          }
                          return '';
                        }).filter((p: string) => p.length > 0);
                      } else if (Array.isArray(schemeData.document_proof)) {
                        proofsList = schemeData.document_proof;
                      } else if (Array.isArray(schemeData.proofs)) {
                        proofsList = schemeData.proofs;
                      }
                      
                      console.log(`Proofs for ${recommendedSchemeName}:`, proofsList);
                      console.log(`Benefit summary for ${recommendedSchemeName}:`, schemeData.benefit_summary);
                      
                      // Extract decision explanation from outputData
                      let decisionExplanation = null;
                      if (item.outputData.decision_explanation) {
                        decisionExplanation = item.outputData.decision_explanation;
                      }
                      
                      uniqueSchemes.set(recommendedSchemeName, {
                        name: recommendedSchemeName,
                        fullName: schemeData.fullName || recommendedSchemeName,
                        description: schemeData.benefit_summary || schemeData.description || schemeData.details || 'No description available',
                        benefitSummary: schemeData.benefit_summary,
                        decisionExplanation: decisionExplanation,
                        proofs: proofsList,
                        details: schemeData.details || schemeData.description || '',
                        ...schemeData
                      });
                    }
                  }
                }
              }
            }
          });
          
          const schemesArray = Array.from(uniqueSchemes.values());
          console.log('Final applicable schemes:', schemesArray);
          setApplicableSchemes(schemesArray);
        }
      } catch (error) {
        console.error('Failed to fetch eligibility count:', error);
      }
    };

    if (user) {
      fetchEligibilityCount();
    }
  }, [user, refreshKey]);

  const schemes = [
    {
      name: 'PM-KISAN',
      fullName: 'Pradhan Mantri Kisan Samman Nidhi',
      description: 'Direct income support of ₹6,000/year to all farmer families',
      color: 'emerald',
      icon: '🌾',
    },
    {
      name: 'PM-KUSUM',
      fullName: 'PM Kisan Urja Suraksha evam Utthaan Mahabhiyan',
      description: 'Solar pump subsidy scheme for farmers',
      color: 'orange',
      icon: '☀️',
    },
    {
      name: 'AIF',
      fullName: 'Agriculture Infrastructure Fund',
      description: 'Financing facility for agriculture infrastructure projects',
      color: 'blue',
      icon: '🏗️',
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Top 4 Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Profile Summary Card */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
          onClick={() => setShowProfileModal(true)}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 cursor-pointer border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
            Profile Summary
          </h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm">
            View your complete profile details
          </p>
          <div className="mt-4 pt-4 border-t border-purple-300 dark:border-purple-600">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {user?.name || 'Farmer'}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              @{user?.username}
            </p>
          </div>
        </motion.div>

        {/* Eligibility Checks Card */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
          onClick={() => navigate('/history')}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 cursor-pointer border-2 border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
              <FileCheck className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
            Eligibility Checks
          </h3>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm">
            Total checks performed
          </p>
          <div className="mt-4 pt-4 border-t border-emerald-300 dark:border-emerald-600">
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-emerald-900 dark:text-emerald-100">
                {eligibilityCount}
              </p>
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Click to view history
            </p>
          </div>
        </motion.div>

        {/* Available Schemes Card */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
          onClick={() => setShowSchemesModal(true)}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 cursor-pointer border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <List className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            All Schemes
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Explore government schemes
          </p>
          <div className="mt-4 pt-4 border-t border-blue-300 dark:border-blue-600">
            <p className="text-5xl font-bold text-blue-900 dark:text-blue-100">
              3
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Total schemes
            </p>
          </div>
        </motion.div>

        {/* Applicable Schemes Card */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
          onClick={() => setShowApplicableSchemesModal(true)}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 cursor-pointer border-2 border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
            Applicable Schemes
          </h3>
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            Schemes you qualify for
          </p>
          <div className="mt-4 pt-4 border-t border-orange-300 dark:border-orange-600">
            <p className="text-5xl font-bold text-orange-900 dark:text-orange-100">
              {applicableSchemes.length}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Recommended schemes
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Recent Activity + Check Eligibility Button */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activity - Left Side (2 columns) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="md:col-span-2 bg-white dark:bg-dark-background rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-saffron" />
            <h3 className="text-2xl font-bold">Recent Activity</h3>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border transition-colors cursor-pointer"
                  onClick={() => navigate('/history')}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron to-green flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-light-muted-foreground dark:text-dark-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                No recent activity
              </p>
              <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-2">
                Start by checking your eligibility
              </p>
            </div>
          )}
        </motion.div>

        {/* Check Eligibility Button + Quick Actions - Right Side (1 column) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Check Eligibility Card */}
          <div className="bg-gradient-to-br from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-2xl p-6 border-2 border-saffron/30 dark:border-saffron/50 shadow-lg flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-saffron to-green flex items-center justify-center mb-4"
            >
              <FileCheck className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
              Check Eligibility Now
            </h3>
            
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-4 text-sm">
              Find out which schemes you qualify for
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/check-eligibility')}
              className="w-full bg-gradient-to-r from-saffron to-green text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-dark-background rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {/* View History */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/history')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">View History</p>
                  <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                    Past eligibility checks
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </motion.button>

              {/* My Profile */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">My Profile</p>
                  <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                    Update your details
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </motion.button>

              {/* Support */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/support')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">Get Support</p>
                  <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                    Need help? Contact us
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </motion.button>

              {/* FAQs */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/faqs')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">FAQs</p>
                  <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                    Common questions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-background rounded-2xl p-8 max-w-md w-full shadow-2xl border border-light-border dark:border-dark-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Profile Details</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-light-muted dark:hover:bg-dark-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user?.name}</p>
                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                      @{user?.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-xl">
                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                      Aadhar Number
                    </p>
                    <p className="font-semibold">
                      {user?.aadhar ? `XXXX XXXX ${user.aadhar.slice(-4)}` : 'Not provided'}
                    </p>
                  </div>

                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-xl">
                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                      Mobile
                    </p>
                    <p className="font-semibold">{user?.mobile || user?.phoneNumber || 'Not provided'}</p>
                  </div>

                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-xl">
                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                      Location
                    </p>
                    <p className="font-semibold">
                      {user?.district && user?.state
                        ? `${user.district}, ${user.state}`
                        : 'Not provided'}
                    </p>
                  </div>


                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate('/profile');
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Edit Profile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schemes Modal */}
      <AnimatePresence>
        {showSchemesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSchemesModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-background rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Available Schemes</h2>
                <button
                  onClick={() => setShowSchemesModal(false)}
                  className="p-2 hover:bg-light-muted dark:hover:bg-dark-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {schemes.map((scheme, index) => (
                  <motion.div
                    key={scheme.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border-2 bg-gradient-to-br hover:shadow-lg transition-all cursor-pointer ${
                      scheme.color === 'emerald'
                        ? 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700'
                        : scheme.color === 'orange'
                        ? 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'
                        : 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{scheme.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{scheme.name}</h3>
                        <p className="text-sm font-semibold text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                          {scheme.fullName}
                        </p>
                        <p className="text-sm">{scheme.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowSchemesModal(false);
                  navigate('/check-eligibility');
                }}
                className="w-full mt-6 bg-gradient-to-r from-saffron to-green text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Check Your Eligibility
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicable Schemes Modal */}
      <AnimatePresence>
        {showApplicableSchemesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplicableSchemesModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-background rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Applicable Schemes ({applicableSchemes.length})</h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    className="p-2 hover:bg-light-muted dark:hover:bg-dark-muted rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                  <button
                    onClick={() => setShowApplicableSchemesModal(false)}
                    className="p-2 hover:bg-light-muted dark:hover:bg-dark-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {applicableSchemes.length > 0 ? (
                <div className="space-y-4">
                  {applicableSchemes.map((scheme, index) => (
                    <motion.div
                      key={scheme.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl border-2 bg-gradient-to-br hover:shadow-lg transition-all cursor-pointer ${
                        selectedScheme === scheme.name
                          ? 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-500 dark:border-orange-400 shadow-lg'
                          : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'
                      }`}
                      onClick={() => setSelectedScheme(selectedScheme === scheme.name ? null : scheme.name)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">✓</div>
                        <div className="flex-1 w-full">
                          <h3 className="text-xl font-bold mb-1">{scheme.fullName || scheme.name}</h3>
                          <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-3">
                            {scheme.name}
                          </p>
                          
                          {/* Expandable Details */}
                          <AnimatePresence>
                            {selectedScheme === scheme.name && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-orange-300 dark:border-orange-600 space-y-3"
                              >
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  ✓ You are eligible for this scheme
                                </p>
                                
                                {scheme.benefitSummary && (
                                  <div>
                                    <p className="text-sm font-semibold mb-1">Benefit:</p>
                                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                      {scheme.benefitSummary}
                                    </p>
                                  </div>
                                )}
                                
                                {scheme.decisionExplanation && scheme.decisionExplanation.decision_reason && (
                                  <div>
                                    <p className="text-sm font-semibold mb-1">Why this scheme:</p>
                                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                                      {scheme.decisionExplanation.decision_reason}
                                    </p>
                                  </div>
                                )}
                                
                                {scheme.proofs && Array.isArray(scheme.proofs) && scheme.proofs.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold mb-2">Proof:</p>
                                    <ul className="space-y-1">
                                      {scheme.proofs.map((proof: any, idx: number) => (
                                        <motion.li
                                          key={idx}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="text-sm flex items-start gap-2 text-light-muted-foreground dark:text-dark-muted-foreground"
                                        >
                                          <span className="text-orange-500 font-bold mt-0.5">•</span>
                                          <span>{typeof proof === 'string' ? proof : JSON.stringify(proof)}</span>
                                        </motion.li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {(!scheme.proofs || scheme.proofs.length === 0) && (
                                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground italic">
                                    No proofs required for this scheme.
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-light-muted-foreground dark:text-dark-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                    No applicable schemes yet
                  </p>
                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mt-2">
                    Check your eligibility to find applicable schemes
                  </p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowApplicableSchemesModal(false);
                  navigate('/history');
                }}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                View Full History
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
