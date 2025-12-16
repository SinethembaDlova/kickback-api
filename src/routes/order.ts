// src/routes/orders.ts
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  uploadAfterPhotos,
  updateOrderPayment
} from '../controllers/order';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/payment', updateOrderPayment);

// Admin/Technician routes
router.patch('/:orderId', requireRole(['admin', 'technician']), updateOrderStatus);
router.patch('/:orderId/after-photos', requireRole(['admin', 'technician']), uploadAfterPhotos);

export default router;