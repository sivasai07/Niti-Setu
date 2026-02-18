import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileText, CheckCircle, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';

export function HistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch user history
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/history', {
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

  const deleteHistoryEntry = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this history entry?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/history/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setHistory(history.filter(item => item._id !== itemId));
        // Close modal
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
                Activity History
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                Track your interactions and activities on Niti-Setu
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
                    
                    {/* Best Scheme Recommendation */}
                    {selectedItem.outputData.best_scheme && (
                      <div className="bg-gradient-to-r from-saffron/10 to-green/10 dark:from-saffron/20 dark:to-green/20 rounded-lg p-4 mb-4 border-l-4 border-saffron">
                        <h5 className="font-semibold mb-2 text-saffron">Recommended: {selectedItem.outputData.best_scheme}</h5>
                        <p className="text-sm text-light-foreground dark:text-dark-foreground">
                          {selectedItem.outputData.summary}
                        </p>
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
                        {selectedItem.outputData['PM-KISAN'].benefit && (
                          <p className="text-sm text-green font-medium mb-2">
                            Benefit: {selectedItem.outputData['PM-KISAN'].benefit}
                          </p>
                        )}
                        <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                          {selectedItem.outputData['PM-KISAN'].reason?.message || 'No details available'}
                        </p>
                      </div>
                    )}

                    {/* PM-KUSUM */}
                    {selectedItem.outputData['PM-KUSUM'] && selectedItem.outputData['PM-KUSUM'].components && (
                      <div className="bg-light-muted dark:bg-dark-muted rounded-lg p-4 border-l-4 border-orange-500">
                        <h5 className="font-semibold mb-3">PM-KUSUM Components</h5>
                        <div className="space-y-2">
                          {Object.entries(selectedItem.outputData['PM-KUSUM'].components).map(([name, comp]: [string, any]) => (
                            <div key={name} className="flex items-center justify-between p-2 bg-white dark:bg-dark-background rounded">
                              <span className="text-sm">{name.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                {comp.subsidy_percent && (
                                  <span className="text-xs text-orange-600 dark:text-orange-400">
                                    {comp.subsidy_percent}% subsidy
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  comp.eligible
                                    ? 'bg-green/10 text-green'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                  {comp.eligible ? '✓' : '✗'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-light-muted dark:bg-dark-muted rounded-lg text-center">
                    <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No eligibility results available for this entry.</p>
                  </div>
                )}

                {/* Delete Button */}
                <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
                  <button
                    onClick={() => deleteHistoryEntry(selectedItem._id)}
                    disabled={isDeleting}
                    className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    {isDeleting ? 'Deleting...' : 'Delete This Entry'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
