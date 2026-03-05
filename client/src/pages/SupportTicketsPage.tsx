import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Send, X, Image as ImageIcon } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Button } from '../components/ui/Button';

interface TicketType {
  _id: string;
  ticketId: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  messages: Array<{
    sender: {
      _id?: string;
      id?: string;
      name: string;
      username: string;
      role: string;
    } | string;
    message: string;
    image?: string;
    timestamp: string;
    isAdmin: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function SupportTicketsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create ticket form
  const [createForm, setCreateForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when ticket is selected or messages change
  useEffect(() => {
    if (selectedTicket) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedTicket, selectedTicket?.messages]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    fetchTickets();
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      // Use different endpoint for admin
      const endpoint = userData?.role === 'admin' 
        ? 'http://localhost:5000/api/tickets/admin/all'
        : 'http://localhost:5000/api/tickets';
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('category', createForm.category);
      formData.append('subject', createForm.subject);
      formData.append('description', createForm.description);
      formData.append('priority', createForm.priority);
      if (createImage) {
        formData.append('image', createImage);
      }

      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setTickets([data.ticket, ...tickets]);
        setShowCreateModal(false);
        setCreateForm({ category: '', subject: '', description: '', priority: 'medium' });
        setCreateImage(null);
        setCreateImagePreview(null);
      } else {
        alert(data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('message', newMessage || 'Sent an image');
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log('Sending message with image:', selectedImage?.name);

      const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        setSelectedTicket(data.ticket);
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        // Update ticket in list
        setTickets(tickets.map(t => t._id === data.ticket._id ? data.ticket : t));
        // Scroll to bottom after message is sent
        setTimeout(scrollToBottom, 100);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setCreateImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCreateImage = () => {
    setCreateImage(null);
    setCreateImagePreview(null);
    if (createFileInputRef.current) {
      createFileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '🔧';
      case 'scheme_info':
        return '📋';
      case 'account':
        return '👤';
      case 'eligibility':
        return '✅';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground">Loading tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Ticket className="w-10 h-10 text-saffron" />
                Support Tickets
              </h1>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
                {user?.role === 'admin' 
                  ? 'Manage and respond to farmer support requests'
                  : 'Get help with your queries and issues'}
              </p>
            </div>
            {/* Only show Create button for farmers */}
            {user?.role !== 'admin' && (
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Ticket
              </Button>
            )}
          </motion.div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-12 text-center"
            >
              <Ticket className="w-16 h-16 mx-auto mb-4 text-light-muted-foreground dark:text-dark-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {user?.role === 'admin' ? 'No Support Tickets' : 'No Tickets Yet'}
              </h3>
              <p className="text-light-muted-foreground dark:text-dark-muted-foreground">
                {user?.role === 'admin' 
                  ? 'No farmers have created support tickets yet'
                  : 'Click the "Create Ticket" button above to get help'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-light-border dark:border-dark-border p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                            {ticket.ticketId} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-light-muted-foreground dark:text-dark-muted-foreground line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {ticket.messages.length > 1 && (
                          <span className="flex items-center gap-1 text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.messages.length} messages
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-saffron to-green p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-white">Create New Ticket</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                  >
                    <option value="">Select Category</option>
                    <option value="technical">🔧 Technical Issue</option>
                    <option value="scheme_info">📋 Scheme Information</option>
                    <option value="account">👤 Account Related</option>
                    <option value="eligibility">✅ Eligibility Query</option>
                    <option value="other">❓ Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    placeholder="Brief description of your issue"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron resize-none"
                    placeholder="Provide detailed information about your issue..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Attach Image (Optional)</label>
                  <input
                    ref={createFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCreateImageSelect}
                    className="hidden"
                  />
                  
                  {createImagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={createImagePreview} 
                        alt="Preview" 
                        className="max-h-40 rounded-lg border-2 border-saffron"
                      />
                      <button
                        type="button"
                        onClick={removeCreateImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      className="w-full px-4 py-8 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg hover:border-saffron dark:hover:border-saffron transition-colors flex flex-col items-center gap-2 text-light-muted-foreground dark:text-dark-muted-foreground hover:text-saffron"
                    >
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-sm">Click to upload proof image</span>
                      <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
                    </button>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-saffron to-green hover:shadow-xl text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Create Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-saffron to-green p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                  <p className="text-white/80 text-sm">{selectedTicket.ticketId}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.messages.map((msg, index) => {
                  // Check if message is from current user
                  // Try multiple possible ID fields
                  const currentUserId = user?._id || user?.id;
                  // Handle both populated and non-populated sender
                  const messageSenderId = typeof msg.sender === 'object' ? (msg.sender._id || msg.sender.id) : msg.sender;
                  const isCurrentUser = messageSenderId?.toString() === currentUserId?.toString();
                  
                  return (
                    <div
                      key={index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl p-4 shadow-md ${
                        isCurrentUser 
                          ? 'bg-gradient-to-br from-saffron/20 via-orange-100 to-green/20 dark:from-saffron/30 dark:via-orange-900/30 dark:to-green/30 border-l-4 border-saffron' 
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold text-sm ${isCurrentUser ? 'text-saffron dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {isCurrentUser ? 'You' : (typeof msg.sender === 'object' ? msg.sender.name : 'User')}
                          </span>
                          {msg.isAdmin && (
                            <span className="px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className={`${isCurrentUser ? 'text-gray-800 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'} leading-relaxed`}>
                          {msg.message}
                        </p>
                        {msg.image && (
                          <div className="mt-3">
                            <img 
                              src={`http://localhost:5000${msg.image}`} 
                              alt="Attachment" 
                              className="max-w-full rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(`http://localhost:5000${msg.image}`, '_blank')}
                            />
                          </div>
                        )}
                        <p className={`text-xs mt-2 ${
                          isCurrentUser 
                            ? 'text-right text-saffron/70 dark:text-orange-400/70' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(msg.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* Invisible div for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-light-border dark:border-dark-border p-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3 relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-32 rounded-lg border-2 border-saffron"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    {/* Image upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-3 bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border text-light-foreground dark:text-dark-foreground rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      title="Attach image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-saffron"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || (!newMessage.trim() && !selectedImage)}
                      className="px-6 py-3 bg-gradient-to-r from-saffron to-green hover:shadow-xl text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
