import User from '../models/User.js';
import Story from '../models/Story.js';
import Feedback from '../models/Feedback.js';
import History from '../models/History.js';

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
    const totalStories = await Story.countDocuments();
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

// @desc    Get recent activity
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
export const getRecentActivity = async (req, res) => {
  try {
    // Get recent feedbacks
    const recentFeedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'username email name');

    // Get recent stories
    const recentStories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'name');

    res.status(200).json({
      success: true,
      recentFeedbacks,
      recentStories,
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
