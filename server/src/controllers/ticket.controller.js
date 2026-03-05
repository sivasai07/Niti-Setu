import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { category, subject, description, priority } = req.body;
    const userId = req.user.id;
    const image = req.file ? `/uploads/tickets/${req.file.filename}` : null;

    // Validate required fields
    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required',
      });
    }

    // Generate ticket ID
    const count = await Ticket.countDocuments();
    const ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;

    // Create ticket
    const ticket = new Ticket({
      ticketId,
      user: userId,
      category,
      subject,
      description,
      priority: priority || 'medium',
      messages: [{
        sender: userId,
        message: description,
        image,
        isAdmin: false,
      }],
    });

    await ticket.save();

    // Populate user details
    await ticket.populate('user', 'name email username');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message,
    });
  }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category } = req.query;

    // Build query
    const query = { user: userId };
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('user', 'name email username')
      .populate('assignedTo', 'name email username')
      .populate('messages.sender', '_id name username profilePicture role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const ticket = await Ticket.findById(id)
      .populate('user', 'name email username profilePicture')
      .populate('assignedTo', 'name email username')
      .populate('messages.sender', '_id name username profilePicture role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check if user has access to this ticket
    if (!isAdmin && ticket.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message,
    });
  }
};

// Add message to ticket
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const image = req.file ? `/uploads/tickets/${req.file.filename}` : null;

    if (!message && !image) {
      return res.status(400).json({
        success: false,
        message: 'Message or image is required',
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access
    if (!isAdmin && ticket.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Add message
    ticket.messages.push({
      sender: userId,
      message: message || (image ? 'Sent an image' : ''),
      image,
      isAdmin,
    });

    // Update status if admin is responding
    if (isAdmin && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    
    // Populate all necessary fields including _id
    await ticket.populate('user', 'name email username');
    await ticket.populate('messages.sender', '_id name username profilePicture role');

    res.json({
      success: true,
      message: 'Message added successfully',
      ticket,
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message,
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Only admin or ticket owner can update status
    if (!isAdmin && ticket.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    ticket.status = status;
    
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message,
    });
  }
};

// Admin: Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate('user', 'name email username profilePicture')
      .populate('assignedTo', 'name email username')
      .populate('messages.sender', '_id name username profilePicture role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

// Admin: Assign ticket
export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Verify assignedTo is an admin
    if (assignedTo) {
      const admin = await User.findById(assignedTo);
      if (!admin || admin.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Can only assign to admin users',
        });
      }
    }

    ticket.assignedTo = assignedTo || null;
    
    if (assignedTo && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await ticket.populate('assignedTo', 'name email username');

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket,
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
      error: error.message,
    });
  }
};

// Admin: Get ticket statistics
export const getTicketStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in_progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'closed' });

    // Get tickets by category
    const ticketsByCategory = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent tickets
    const recentTickets = await Ticket.find()
      .populate('user', 'name email username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        byCategory: ticketsByCategory,
      },
      recentTickets,
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
      error: error.message,
    });
  }
};
