import User from '../models/User.js';
import Story from '../models/Story.js';
import Feedback from '../models/Feedback.js';
import History from '../models/History.js';
import FAQ from '../models/FAQ.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, mobile, profilePicture } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update only allowed fields
    if (username) user.username = username;
    if (mobile !== undefined) user.mobile = mobile;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // Get counts
    const totalFarmers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Count stories from database
    const dbStories = await Story.countDocuments();
    
    // Count video files in uploads/stories directory
    const storiesDir = path.join(__dirname, '../../uploads/stories');
    let videoCount = 0;
    
    try {
      if (fs.existsSync(storiesDir)) {
        const files = fs.readdirSync(storiesDir);
        videoCount = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext);
        }).length;
      }
    } catch (err) {
      console.error('Error reading stories directory:', err);
    }
    
    // Use the maximum of database stories or video files
    const totalStories = Math.max(dbStories, videoCount);
    
    const totalFeedbacks = await Feedback.countDocuments();
    const totalEligibilityChecks = await History.countDocuments({ type: 'scheme' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFarmers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentStories = await Story.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentFeedbacks = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentEligibilityChecks = await History.countDocuments({
      type: 'scheme',
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalStories,
        totalFeedbacks,
        totalEligibilityChecks,
        recentFarmers,
        recentStories,
        recentFeedbacks,
        recentEligibilityChecks,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get recent activity (aggregated from multiple sources)
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
export const getRecentActivity = async (req, res) => {
  try {
    const limit = 4; // Show exactly 4 recent activities

    // Fetch recent items from each source
    const [feedbacks, stories, faqs, eligibilityChecks] = await Promise.all([
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('farmer', 'username name')
        .lean(),
      
      Story.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('farmer', 'name')
        .lean(),
      
      FAQ.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      
      History.find({ type: 'scheme' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'username name')
        .lean(),
    ]);

    // Transform and combine all activities with type indicator
    const activities = [
      ...feedbacks.map(item => ({
        _id: item._id,
        type: 'feedback',
        title: `${item.farmer?.name || 'Anonymous'} submitted feedback`,
        description: `${item.type === 'video' ? '🎥 Video' : '🎤 Audio'} feedback`,
        createdAt: item.createdAt,
        userName: item.farmer?.name || 'Anonymous',
      })),
      ...stories.map(item => ({
        _id: item._id,
        type: 'story',
        title: `${item.farmer?.name || 'Farmer'} shared a success story`,
        description: item.story?.substring(0, 60) + (item.story?.length > 60 ? '...' : ''),
        createdAt: item.createdAt,
        userName: item.farmer?.name || 'Farmer',
      })),
      ...faqs.map(item => ({
        _id: item._id,
        type: 'faq',
        title: 'New FAQ added',
        description: item.question?.substring(0, 60) + (item.question?.length > 60 ? '...' : ''),
        createdAt: item.createdAt,
        userName: 'Admin',
      })),
      ...eligibilityChecks.map(item => ({
        _id: item._id,
        type: 'eligibility',
        title: `${item.user?.name || 'User'} checked eligibility`,
        description: `Checked schemes`,
        createdAt: item.createdAt,
        userName: item.user?.name || 'User',
      })),
    ];

    // Sort by createdAt and limit to exactly 4 most recent
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentActivities = activities.slice(0, 4);

    res.status(200).json({
      success: true,
      activities: recentActivities,
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get system status
// @route   GET /api/admin/system-status
// @access  Private/Admin
export const getSystemStatus = async (req, res) => {
  try {
    const status = {
      server: 'Online',
      database: 'Connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
    };

    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all users' history (for admin)
// @route   GET /api/admin/all-history
// @access  Private/Admin
export const getAllHistory = async (req, res) => {
  try {
    // Fetch all history records with user details
    const history = await History.find({ type: 'scheme' })
      .populate('user', 'name username email mobile role')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 records for performance

    // Transform the data to use 'farmer' key for frontend compatibility
    const transformedHistory = history.map(item => ({
      ...item.toObject(),
      farmer: item.user, // Add farmer field pointing to user data
    }));

    res.status(200).json({
      success: true,
      history: transformedHistory,
    });
  } catch (error) {
    console.error('Get all history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
