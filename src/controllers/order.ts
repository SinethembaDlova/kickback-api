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