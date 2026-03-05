import express from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadTicketImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// User routes
router.post('/', protect, uploadTicketImage.single('image'), ticketController.createTicket);
router.get('/', protect, ticketController.getUserTickets);
router.get('/:id', protect, ticketController.getTicketById);
router.post('/:id/messages', protect, uploadTicketImage.single('image'), ticketController.addMessage);
router.put('/:id/status', protect, ticketController.updateTicketStatus);

// Admin routes
router.get('/admin/all', protect, adminOnly, ticketController.getAllTickets);
router.get('/admin/stats', protect, adminOnly, ticketController.getTicketStats);
router.put('/admin/:id/assign', protect, adminOnly, ticketController.assignTicket);

export default router;
