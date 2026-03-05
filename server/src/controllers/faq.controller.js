import FAQ from '../models/FAQ.js';

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create FAQ (admin only)
// @route   POST /api/faqs
// @access  Private (Admin)
export const createFAQ = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create FAQs',
      });
    }

    const { question, answer, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required',
      });
    }

    const faq = await FAQ.create({
      question,
      answer,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq,
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update FAQ (admin only)
// @route   PUT /api/faqs/:id
// @access  Private (Admin)
export const updateFAQ = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update FAQs',
      });
    }

    const { question, answer, order, isActive } = req.body;

    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      faq,
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete FAQ (admin only)
// @route   DELETE /api/faqs/:id
// @access  Private (Admin)
export const deleteFAQ = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete FAQs',
      });
    }

    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
