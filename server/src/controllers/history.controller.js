import History from '../models/History.js';

// @desc    Get user history
// @route   GET /api/history
// @access  Private
export const getUserHistory = async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Add history entry
// @route   POST /api/history
// @access  Private
export const addHistoryEntry = async (req, res) => {
  try {
    const { type, title, description, status, inputData, outputData } = req.body;

    console.log('Creating history entry with data:', {
      type,
      title,
      hasInputData: !!inputData,
      hasOutputData: !!outputData,
    });

    const historyEntry = await History.create({
      user: req.user.id,
      type,
      title,
      description,
      status: status || 'completed',
      inputData: inputData || null,
      outputData: outputData || null,
    });

    res.status(201).json({
      success: true,
      historyEntry,
    });
  } catch (error) {
    console.error('Add history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete history entry
// @route   DELETE /api/history/:id
// @access  Private
export const deleteHistoryEntry = async (req, res) => {
  try {
    const historyEntry = await History.findById(req.params.id);

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found',
      });
    }

    // Allow deletion if user owns the entry OR if user is admin
    if (historyEntry.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this entry',
      });
    }

    await historyEntry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'History entry deleted',
    });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
