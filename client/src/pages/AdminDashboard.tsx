import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, Activity, Server, Database, Zap, ArrowRight } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    
    // Check if user is admin
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(userData);
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch recent activity
      const activityRes = await fetch('http://localhost:5000/api/admin/recent-activity', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const activityData = await activityRes.json();
      if (activityData.success) setActivities(activityData.activities || []);

      // Fetch system status
      const statusRes = await fetch('http://localhost:5000/api/admin/system-status', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      if (statusData.success) setSystemStatus(statusData.status);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-muted-foreground dark:text-dark-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">{user.username}!</span> 👋
            </h1>
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
              Manage your platform, monitor users, and keep everything running smoothly
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Farmers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                console.log('Total Farmers card clicked!');
                navigate('/users');
              }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {stats && stats.recentFarmers > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.recentFarmers} this week
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">TOTAL FARMERS</h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalFarmers || 0}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active users</p>
            </motion.div>

            {/* Total Stories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/stories')}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                {stats && stats.recentStories > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.recentStories} this week
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">TOTAL STORIES</h3>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats?.totalStories || 0}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Success stories</p>
            </motion.div>

            {/* Total Feedbacks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/feedback')}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-700 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-3xl">💬</span>
                </div>
                {stats && stats.recentFeedbacks > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.recentFeedbacks} this week
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">TOTAL FEEDBACKS</h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats?.totalFeedbacks || 0}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">User feedback</p>
            </motion.div>

            {/* Total Eligibility Checks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate('/history')}
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                {stats && stats.recentEligibilityChecks > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.recentEligibilityChecks} this week
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">ELIGIBILITY CHECKS</h3>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats?.totalEligibilityChecks || 0}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Total checks</p>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6 h-full"
              >
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="w-6 h-6 text-saffron" />
                    Recent Activity
                  </h2>
                </div>

                {activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity: any, index: number) => {
                      // Determine navigation path based on activity type
                      const getNavigationPath = () => {
                        switch (activity.type) {
                          case 'feedback':
                            return '/feedback';
                          case 'story':
                            return '/stories';
                          case 'faq':
                            return '/faqs';
                          case 'eligibility':
                            return '/history';
                          default:
                            return '/';
                        }
                      };

                      // Determine badge color and icon based on activity type
                      const getBadgeStyle = () => {
                        switch (activity.type) {
                          case 'feedback':
                            return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Feedback', icon: '💬' };
                          case 'story':
                            return { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', label: 'Story', icon: '📖' };
                          case 'faq':
                            return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'FAQ', icon: '❓' };
                          case 'eligibility':
                            return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', label: 'Eligibility', icon: '✅' };
                          default:
                            return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-700 dark:text-gray-400', label: 'Activity', icon: '📌' };
                        }
                      };

                      const badgeStyle = getBadgeStyle();

                      return (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => navigate(getNavigationPath())}
                          className="p-4 bg-light-muted dark:bg-dark-muted rounded-lg border border-light-border dark:border-dark-border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{badgeStyle.icon}</span>
                                <p className="font-semibold text-light-foreground dark:text-dark-foreground">
                                  {activity.title}
                                </p>
                              </div>
                              <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 ${badgeStyle.bg} ${badgeStyle.text} rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0`}>
                              {badgeStyle.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-light-muted-foreground dark:text-dark-muted-foreground opacity-50" />
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No recent activity</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions & System Status - Takes 1 column */}
            <div className="space-y-6 flex flex-col">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/feedback')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between"
                  >
                    <span>Manage Feedbacks</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/stories')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between"
                  >
                    <span>View Stories</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between"
                  >
                    <span>Support Center</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6 flex-1"
              >
                <h2 className="text-2xl font-bold mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Server Status</span>
                    </div>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {systemStatus?.server || 'Online'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Database</span>
                    </div>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {systemStatus?.database || 'Connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Uptime</span>
                    </div>
                    <span className="text-light-muted-foreground dark:text-dark-muted-foreground">
                      {systemStatus?.uptime ? `${Math.floor(systemStatus.uptime / 3600)}h ${Math.floor((systemStatus.uptime % 3600) / 60)}m` : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
