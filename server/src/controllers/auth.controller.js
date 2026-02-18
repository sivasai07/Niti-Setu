import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, username, phoneNumber, city, district, state, pincode, language, pin, role } = req.body;

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered. Please use a different number.',
        field: 'phoneNumber',
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken. Please choose a different username.',
        field: 'username',
      });
    }

    // Check if admin already exists (security measure)
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: 'Admin already exists. Registering as farmer.',
          forceRole: 'farmer',
        });
      }
    }

    // Create new user
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      phoneNumber,
      city,
      district,
      state,
      pincode,
      language,
      role: role || 'farmer',
      pin,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber,
        role: user.role,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'phoneNumber' 
        ? 'Phone number already registered. Please use a different number.'
        : 'Username already taken. Please choose a different username.';
      return res.status(400).json({
        success: false,
        message,
        field,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { usernameOrPhone, pin } = req.body;

    // Validate input
    if (!usernameOrPhone || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/phone number and PIN',
      });
    }

    // Find user by username or phone number (include pin for comparison)
    const isPhoneNumber = /^[0-9]{10}$/.test(usernameOrPhone);
    const query = isPhoneNumber 
      ? { phoneNumber: usernameOrPhone }
      : { username: usernameOrPhone.toLowerCase() };
    
    const user = await User.findOne(query).select('+pin');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect credentials. Please try again.',
      });
    }

    // Check pin
    const isPinValid = await user.comparePin(pin);

    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect credentials. Please try again.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber,
        role: user.role,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Check if admin exists
// @route   GET /api/auth/check-admin
// @access  Public
export const checkAdminExists = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    res.status(200).json({
      success: true,
      adminExists: !!adminExists,
    });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, username, city, district, state, pincode, language, profilePicture, newPin, currentPin } = req.body;

    const user = await User.findById(req.user.id).select('+pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if username is being changed and if it's already taken
    if (username && username.toLowerCase() !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken. Please choose a different username.',
          field: 'username',
        });
      }
      user.username = username.toLowerCase();
    }

    // Update PIN if provided
    if (newPin && currentPin) {
      // Verify current PIN
      const isPinValid = await user.comparePin(currentPin);
      if (!isPinValid) {
        return res.status(400).json({
          success: false,
          message: 'Current PIN is incorrect',
          field: 'currentPin',
        });
      }
      user.pin = newPin;
    }

    // Update other fields
    if (name) user.name = name;
    if (city) user.city = city;
    if (district) user.district = district;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;
    if (language) user.language = language;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    // Return user without PIN
    const updatedUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        city: updatedUser.city,
        district: updatedUser.district,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        language: updatedUser.language,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'username' 
        ? 'Username already taken. Please choose a different username.'
        : 'This value is already in use.';
      return res.status(400).json({
        success: false,
        message,
        field,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
