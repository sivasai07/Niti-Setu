import Feedback from '../models/Feedback.js';
import Story from '../models/Story.js';
import History from '../models/History.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Submit feedback (farmer only)
// @route   POST /api/feedback
// @access  Private (Farmer)
export const submitFeedback = async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can submit feedback',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { type } = req.body;

    if (!type || !['video', 'audio'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type',
      });
    }

    // Create feedback record
    const feedback = await Feedback.create({
      farmer: req.user.id,
      farmerName: req.user.name,
      type,
      fileUrl: `/uploads/feedback/${req.file.filename}`,
      fileName: req.file.filename,
    });

    // Add to history
    await History.create({
      user: req.user.id,
      type: 'feedback',
      title: 'Submitted Feedback',
      description: `${type === 'video' ? 'Video' : 'Audio'} feedback submitted successfully`,
      status: 'completed',
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all feedbacks (admin only)
// @route   GET /api/feedback
// @access  Private (Admin)
export const getAllFeedbacks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all feedbacks',
      });
    }

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('farmer', 'name phoneNumber city');

    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Convert feedback to story (admin only)
// @route   POST /api/feedback/:id/convert-to-story
// @access  Private (Admin)
export const convertFeedbackToStory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can convert feedback to stories',
      });
    }

    const { farmerName, location, story, scheme, impact } = req.body;
    const feedbackId = req.params.id;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Create story from feedback
    const newStory = await Story.create({
      farmerName,
      location,
      story,
      scheme,
      impact,
      sourceType: 'feedback',
      sourceFeedback: feedbackId,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback converted to story successfully',
      story: newStory,
    });
  } catch (error) {
    console.error('Convert feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
