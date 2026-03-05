import Story from '../models/Story.js';

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error('Get all stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get story by ID
// @route   GET /api/stories/:id
// @access  Public
export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create story (admin only)
// @route   POST /api/stories
// @access  Private (Admin)
export const createStory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create stories',
      });
    }

    const { farmerName, location, story, scheme, impact, imageUrl } = req.body;

    if (!farmerName || !location || !story || !scheme || !impact) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const newStory = await Story.create({
      farmerName,
      location,
      story,
      scheme,
      impact,
      imageUrl: imageUrl || '/images/farmer-image.png',
    });

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story: newStory,
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update story (admin only)
// @route   PUT /api/stories/:id
// @access  Private (Admin)
export const updateStory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update stories',
      });
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      story,
    });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete story (admin only)
// @route   DELETE /api/stories/:id
// @access  Private (Admin)
export const deleteStory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete stories',
      });
    }

    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
