import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileText, CheckCircle, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';

export function HistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch history based on user role
    fetchHistory(userData.role);
  }, [navigate]);

  const fetchHistory = async (userRole: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // If admin, fetch all users' history; otherwise fetch only user's own history
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/admin/all-history'
        : 'http://localhost:5000/api/history';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const openModal = (item: any) => {
    console.log('Opening modal with item:', item);
    console.log('Has inputData:', !!item.inputData);
    console.log('Has outputData:', !!item.outputData);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const openDeleteConfirm = (item: any) => {
    setDeleteConfirmItem(item);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmItem(null);
  };

  const deleteHistoryEntry = async () => {
    if (!deleteConfirmItem) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/history/${deleteConfirmItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setHistory(history.filter(item => item._id !== deleteConfirmItem._id));
        // Close modals
        closeDeleteConfirm();
        closeModal();
      } else {
        alert('Failed to delete history entry');
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Error deleting history entry');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-sans font-bold mb-2 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                {user?.role === 'admin' ? 'All Eligibility Checks' : 'Activity History'}
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                {user?.role === 'admin' 
                  ? 'View all farmers\' eligibility check history and results'
                  : 'Track your interactions and activities on Niti-Setu'}
              </p>
            </div>

            {/* History Timeline */}
            {history.length === 0 ? (
              <div className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-light-muted-foreground dark:text-dark-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                  Your activity history will appear here as you use Niti-Setu
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                    onClick={() => {
                      console.log('Card clicked:', item.type, 'has inputData:', !!item.inputData);
                      if (item.type === 'scheme') {
                        openModal(item);
                      }
                    }}
                  >
                    <div 
                      className={`p-6 ${item.type === 'scheme' && item.inputData ? 'hover:bg-light-muted/50 dark:hover:bg-dark-muted/50 transition-colors' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center flex-shrink-0">
                          {item.type === 'scheme' ? (
                            <FileText className="w-6 h-6 text-white" />
                          ) : item.type === 'feedback' ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Clock className="w-6 h-6 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Show farmer name for admin */}
                              {user?.role === 'admin' && item.farmer && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {item.farmer.name?.charAt(0).toUpperCase() || 'F'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{item.farmer.name || 'Unknown Farmer'}</p>
                                    <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                                      @{item.farmer.username || 'N/A'} • {item.farmer.role ? item.farmer.role.charAt(0).toUpperCase() + item.farmer.role.slice(1) : item.farmer.mobile || 'Farmer'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-sm mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {item.status && (
                                  <span className={`px-2 py-1 rounded-full ${
                                    item.status === 'completed' 
                                      ? 'bg-green/10 text-green'
                                      : 'bg-saffron/10 text-saffron'
                                  }`}>
                                    {item.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.type === 'scheme' && item.inputData && (
                              <button className="ml-4 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-saffron" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sample Data for Demo */}
            {history.length === 0 && (
              <div className="mt-8 space-y-4">
                <p className="text-center text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-4">
                  Example activities that will appear here:
                </p>
                
                <div className="bg-white/50 dark:bg-dark-background/50 rounded-xl border border-light-border dark:border-dark-border p-6 opacity-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Viewed Scheme Details</h3>
                      <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-sm mb-2">
                        PM-KISAN Scheme eligibility checked
                      </p>
                      <span className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                        Example timestamp
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-dark-background/50 rounded-xl border border-light-border dark:border-dark-border p-6 opacity-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Submitted Feedback</h3>
                      <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-sm mb-2">
                        Video feedback submitted successfully
                      </p>
                      <span className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">
                        Example timestamp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Popup for Full Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-saffron to-green p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    {/* Show farmer name for admin */}
                    {user?.role === 'admin' && selectedItem.farmer && (
                      <p className="text-white/90 text-sm mb-1">
                        Farmer: {selectedItem.farmer.name} (@{selectedItem.farmer.username})
                      </p>
                    )}
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-white/80 text-sm">
                      {new Date(selectedItem.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {/* Show message if no detailed data available */}
                {!selectedItem.inputData && !selectedItem.outputData && (
                  <div className="p-6 bg-light-muted dark:bg-dark-muted rounded-lg text-center">
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-2">
                      This is an older history entry without detailed information.
                    </p>
                    <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                      New eligibility checks will include full details here.
                    </p>
                  </div>
                )}

                {/* Input Data */}
                {selectedItem.inputData ? (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-saffron" />
                    Your Input Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">State</p>
                      <p className="font-medium">{selectedItem.inputData.state || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">District</p>
                      <p className="font-medium">{selectedItem.inputData.district || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Land Holding</p>
                      <p className="font-medium">{selectedItem.inputData.landHolding ? `${selectedItem.inputData.landHolding} acres` : 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Crop Type</p>
                      <p className="font-medium">{selectedItem.inputData.cropType || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Category</p>
                      <p className="font-medium">{selectedItem.inputData.socialCategory || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Annual Income</p>
                      <p className="font-medium">{selectedItem.inputData.annualIncome ? `₹${selectedItem.inputData.annualIncome}` : 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Income Tax Payer</p>
                      <p className="font-medium">{selectedItem.inputData.incomeTaxPayer || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Pension</p>
                      <p className="font-medium">{selectedItem.inputData.pension || 'N/A'}</p>
                    </div>
                    <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4">
                      <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">Electricity Connection</p>
                      <p className="font-medium">{selectedItem.inputData.electricityConnection || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="mb-6 p-4 bg-light-muted dark:bg-dark-muted rounded-lg text-center">
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No input details available for this entry.</p>
                  </div>
                )}

                {/* Output Data - Eligible Schemes */}
                {selectedItem.outputData ? (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green" />
                      Eligibility Results
                    </h4>
                    
                    {/* Recommended Scheme */}
                    {selectedItem.outputData.scheme_comparison && (
                      <div className="bg-gradient-to-r from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-lg p-4 mb-4 border-l-4 border-saffron">
                        <h5 className="font-semibold mb-2 text-saffron">
                          🎯 Recommended: {selectedItem.outputData.scheme_comparison.recommended_scheme}
                        </h5>
                        <p className="text-sm text-light-foreground dark:text-dark-foreground mb-2">
                          {selectedItem.outputData.scheme_comparison.comparison_note}
                        </p>
                        <div className="flex gap-4 mt-3">
                          <div className="bg-white dark:bg-dark-background rounded px-3 py-2">
                            <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">Total Eligible</p>
                            <p className="text-lg font-bold text-green">{selectedItem.outputData.scheme_comparison.total_eligible_schemes}</p>
                          </div>
                          <div className="bg-white dark:bg-dark-background rounded px-3 py-2 flex-1">
                            <p className="text-xs text-light-muted-foreground dark:text-dark-muted-foreground">Schemes</p>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {selectedItem.outputData.scheme_comparison.eligible_schemes.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PM-KISAN */}
                    {selectedItem.outputData['PM-KISAN'] && (
                      <div className={`bg-light-muted dark:bg-dark-muted rounded-lg p-4 mb-3 border-l-4 ${
                        selectedItem.outputData['PM-KISAN'].eligible ? 'border-green' : 'border-gray-400'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold">PM-KISAN</h5>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            selectedItem.outputData['PM-KISAN'].eligible
                              ? 'bg-green/10 text-green'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {selectedItem.outputData['PM-KISAN'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                          </span>
                        </div>
                        {selectedItem.outputData['PM-KISAN'].benefit_summary && (
                          <p className="text-sm text-green font-medium mb-2">
                            💰 {selectedItem.outputData['PM-KISAN'].benefit_summary}
                          </p>
                        )}
                        <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                          {selectedItem.outputData['PM-KISAN'].reason_message || 'No details available'}
                        </p>
                        {user?.role === 'admin' && selectedItem.outputData['PM-KISAN'].confidence_score && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-light-muted-foreground dark:text-dark-muted-foreground">Confidence</span>
                              <span className="font-semibold">{(selectedItem.outputData['PM-KISAN'].confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green h-2 rounded-full transition-all"
                                style={{ width: `${selectedItem.outputData['PM-KISAN'].confidence_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PM-KUSUM */}
                    {selectedItem.outputData['PM-KUSUM'] && (
                      <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4 mb-3 border-l-4 border-orange-500">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold">PM-KUSUM</h5>
                          {selectedItem.outputData['PM-KUSUM'].best_component && (
                            <span className="px-3 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              Best: {selectedItem.outputData['PM-KUSUM'].best_component.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        {selectedItem.outputData['PM-KUSUM'].components && (
                          <div className="space-y-2">
                            {Object.entries(selectedItem.outputData['PM-KUSUM'].components).map(([name, comp]: [string, any]) => (
                              <div key={name} className="flex items-center justify-between p-2 bg-white dark:bg-dark-background rounded">
                                <span className="text-sm font-medium">{name.replace(/_/g, ' ')}</span>
                                <div className="flex items-center gap-2">
                                  {comp.subsidy_percent && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                                      {comp.subsidy_percent}% subsidy
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    comp.eligible
                                      ? 'bg-green/10 text-green'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {comp.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {user?.role === 'admin' && selectedItem.outputData['PM-KUSUM'].confidence_score && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-light-muted-foreground dark:text-dark-muted-foreground">Confidence</span>
                              <span className="font-semibold">{(selectedItem.outputData['PM-KUSUM'].confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${selectedItem.outputData['PM-KUSUM'].confidence_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Agriculture Infrastructure Fund (AIF) */}
                    {selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'] && (
                      <div className={`bg-light-muted dark:bg-dark-muted rounded-lg p-4 mb-3 border-l-4 ${
                        selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].eligible ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold">Agriculture Infrastructure Fund (AIF)</h5>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].eligible
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].eligible ? '✓ Eligible' : '✗ Not Eligible'}
                          </span>
                        </div>
                        {selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].benefit_summary && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                            💰 {selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].benefit_summary}
                          </p>
                        )}
                        <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                          {selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].reason_message || 'No details available'}
                        </p>
                        {user?.role === 'admin' && selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].confidence_score && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-light-muted-foreground dark:text-dark-muted-foreground">Confidence</span>
                              <span className="font-semibold">{(selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${selectedItem.outputData['Agriculture Infrastructure Fund (AIF)'].confidence_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-lg text-center">
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No eligibility results available for this entry.</p>
                  </div>
                )}

                {/* Delete Button - Only show for admins */}
                {user?.role === 'admin' && (
                  <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
                    <button
                      onClick={() => openDeleteConfirm(selectedItem)}
                      className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete This Entry
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={closeDeleteConfirm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">
                Delete History Entry?
              </h3>

              {/* Description */}
              <p className="text-center text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
                Are you sure you want to delete this eligibility check? This action cannot be undone.
              </p>

              {/* Entry Info */}
              {deleteConfirmItem.farmer && (
                <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-3 mb-6">
                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground mb-1">
                    Farmer: <span className="font-semibold text-light-foreground dark:text-dark-foreground">{deleteConfirmItem.farmer.name}</span>
                  </p>
                  <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                    Date: <span className="font-semibold text-light-foreground dark:text-dark-foreground">
                      {new Date(deleteConfirmItem.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-light-muted dark:bg-dark-muted text-light-foreground dark:text-dark-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteHistoryEntry}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
