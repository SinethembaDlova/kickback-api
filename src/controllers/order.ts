import { Request, Response } from 'express';
import Order from '../models/Order';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { serviceTier, beforePhotos, pickupDate, pickupTime, deliveryAddress, price } = req.body;

    // Validate required fields
    if (!serviceTier || !pickupDate || !pickupTime || !deliveryAddress || !price) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Validate service tier
    if (!['bronze', 'silver', 'gold'].includes(serviceTier)) {
      res.status(400).json({ message: 'Invalid service tier' });
      return;
    }

    // Calculate estimated delivery (3 days after pickup)
    const pickup = new Date(pickupDate);
    const estimatedDelivery = new Date(pickup);
    estimatedDelivery.setDate(pickup.getDate() + 3);

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      serviceTier,
      beforePhotos: beforePhotos || [],
      afterPhotos: [],
      pickupDate,
      pickupTime,
      deliveryAddress,
      price,
      status: 'submitted',
      payment: {
        status: 'pending',
        amount: price,
        currency: 'ZAR'
      },
      estimatedDelivery
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let query: any = {};

    // If customer, only show their orders
    // If admin or technician, show all orders
    if (req.user.role === 'customer') {
      query.userId = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'firstName lastName email phone');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check authorization - customers can only view their own orders
    if (req.user.role === 'customer' && order.userId._id.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to get order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['submitted', 'picked-up', 'cleaning', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Update status
    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

export const uploadAfterPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { orderId } = req.params;
    const { afterPhotos } = req.body;

    if (!afterPhotos || !Array.isArray(afterPhotos)) {
      res.status(400).json({ message: 'After photos are required' });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Update after photos
    order.afterPhotos = afterPhotos;
    await order.save();

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Upload after photos error:', error);
    res.status(500).json({ message: 'Failed to upload after photos' });
  }
};

export const updateOrderPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { orderId } = req.params;
    const { transactionId, status, method } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check authorization - customers can only update their own orders
    if (req.user.role === 'customer' && order.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Update payment details
    order.payment.status = status || order.payment.status;
    order.payment.transactionId = transactionId || order.payment.transactionId;
    order.payment.method = method || order.payment.method;

    if (status === 'completed') {
      order.payment.paidAt = new Date();
    }

    await order.save();

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};