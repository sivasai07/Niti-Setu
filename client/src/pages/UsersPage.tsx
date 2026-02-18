import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Search, Edit2, Trash2, Save, XCircle } from 'lucide-react';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  mobile?: string;
  role: string;
  profilePicture?: string;
  createdAt: string;
}

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [editModal, setEditModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [editForm, setEditForm] = useState({ username: '', mobile: '', profilePicture: '' });

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Sort users: admins first, then by creation date
        const sortedUsers = data.users.sort((a: User, b: User) => {
          if (a.role === 'admin' && b.role !== 'admin') return -1;
          if (a.role !== 'admin' && b.role === 'admin') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ show: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${deleteModal.user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        // Remove user from list
        setUsers(users.filter((u) => u._id !== deleteModal.user!._id));
        setDeleteModal({ show: false, user: null });
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEditClick = (user: User) => {
    // If clicking edit on any admin user, redirect to profile page
    if (user.role === 'admin') {
      navigate('/profile');
      return;
    }
    setEditForm({
      username: user.username,
      mobile: user.mobile || '',
      profilePicture: user.profilePicture || '',
    });
    setEditModal({ show: true, user });
  };

  const handleEditSave = async () => {
    if (!editModal.user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editModal.user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      
      if (data.success) {
        // Update user in list
        setUsers(users.map((u) => (u._id === editModal.user!._id ? { ...u, ...editForm } : u)));
        setEditModal({ show: false, user: null });
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground">Loading users...</p>
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
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <UsersIcon className="w-10 h-10 text-purple-600" />
              User Management
            </h1>
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-lg">
              Manage all users and their permissions
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-muted rounded-2xl shadow-lg border border-light-border dark:border-dark-border p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-muted-foreground dark:text-dark-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-saffron"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-saffron"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-muted rounded-2xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light-muted dark:bg-dark-background">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-foreground dark:text-dark-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-foreground dark:text-dark-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-foreground dark:text-dark-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-foreground dark:text-dark-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-light-foreground dark:text-dark-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-light-muted dark:hover:bg-dark-background transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-light-muted-foreground dark:text-dark-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-light-muted-foreground dark:text-dark-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => user.role !== 'admin' && handleDeleteClick(user)}
                            disabled={user.role === 'admin'}
                            className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-sm flex items-center gap-1 ${
                              user.role === 'admin'
                                ? 'text-red-300 dark:text-red-800 cursor-not-allowed opacity-50 blur-[0.5px]'
                                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 mx-auto mb-4 text-light-muted-foreground dark:text-dark-muted-foreground opacity-50" />
                  <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setDeleteModal({ show: false, user: null })}
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
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Delete User</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground mb-6">
                  Are you sure you want to delete <span className="font-semibold">{deleteModal.user.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, user: null })}
                    className="flex-1 px-6 py-3 bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border rounded-lg font-semibold transition-all duration-300 text-green-600"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editModal.show && editModal.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEditModal({ show: false, user: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-background rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setEditModal({ show: false, user: null })}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Edit2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center">Edit User</h3>
                <p className="text-light-muted-foreground dark:text-dark-muted-foreground text-center">
                  Update user information
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Profile Picture URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                  <input
                    type="url"
                    value={editForm.profilePicture}
                    onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter profile picture URL"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditModal({ show: false, user: null })}
                  className="flex-1 px-6 py-3 bg-light-muted dark:bg-dark-muted hover:bg-light-border dark:hover:bg-dark-border rounded-lg font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
