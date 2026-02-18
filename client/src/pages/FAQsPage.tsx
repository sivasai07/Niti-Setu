import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export function FAQsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchFAQs();
  }, [navigate]);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faqs');
      const data = await response.json();
      if (response.ok) {
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleAddFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFaqs([...faqs, data.faq]);
        setFormData({ question: '', answer: '' });
        setIsAddingFAQ(false);
      } else {
        alert(data.message || 'Failed to add FAQ');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFAQ = async (id: string) => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFaqs(faqs.map(faq => faq._id === id ? data.faq : faq));
        setFormData({ question: '', answer: '' });
        setEditingFAQ(null);
      } else {
        alert(data.message || 'Failed to update FAQ');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFaqs(faqs.filter(faq => faq._id !== id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete FAQ');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingFAQ(faq._id);
    setFormData({ question: faq.question, answer: faq.answer });
  };

  const cancelEdit = () => {
    setEditingFAQ(null);
    setFormData({ question: '', answer: '' });
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

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
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-sans font-bold mb-4 bg-gradient-to-r from-saffron to-green bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                Find answers to common questions about Niti-Setu
              </p>
            </div>

            {/* Admin: Add FAQ Button */}
            {isAdmin && (
              <div className="mb-6 flex justify-end">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={() => setIsAddingFAQ(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New FAQ
                </Button>
              </div>
            )}

            {/* Add FAQ Form */}
            {isAddingFAQ && isAdmin && (
              <div className="mb-6 bg-white dark:bg-dark-background rounded-xl shadow-lg border border-light-border dark:border-dark-border p-6">
                <h3 className="text-xl font-bold mb-4">Add New FAQ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                      placeholder="Enter answer"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsAddingFAQ(false);
                        setFormData({ question: '', answer: '' });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      size="md"
                      onClick={handleAddFAQ}
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save FAQ'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-light-border dark:border-dark-border p-12 text-center">
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                    No FAQs available yet
                  </p>
                </div>
              ) : (
                faqs.map((faq, index) => (
                  <motion.div
                    key={faq._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
                  >
                    {editingFAQ === faq._id ? (
                      // Edit Mode
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Question</label>
                          <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Answer</label>
                          <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => handleUpdateFAQ(faq._id)}
                            disabled={isLoading}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <button
                          onClick={() => setOpenIndex(openIndex === index ? null : index)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-light-muted dark:hover:bg-dark-muted transition-colors"
                        >
                          <span className="font-semibold text-lg pr-4">{faq.question}</span>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => startEdit(faq)}
                                  className="p-2 hover:bg-saffron/10 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-saffron" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFAQ(faq._id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            )}
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 transition-transform ${
                                openIndex === index ? 'transform rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 text-light-muted-foreground dark:text-dark-muted-foreground">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Contact Support */}
            {user.role !== 'admin' && (
              <div className="mt-12 bg-gradient-to-r from-saffron/10 to-green/10 rounded-2xl p-8 border border-light-border dark:border-dark-border text-center">
                <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <button
                  onClick={() => navigate('/support')}
                  className="px-8 py-3 bg-gradient-to-r from-saffron to-green text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Contact Support
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
