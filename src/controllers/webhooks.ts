import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';

export const handleYocoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify webhook signature
    const signature = req.headers['x-yoco-signature'] as string;
    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('YOCO_WEBHOOK_SECRET not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // 2. Process webhook event
    const { type, payload } = req.body;

    console.log(`Received Yoco webhook: ${type}`);

    if (type === 'payment.succeeded') {
      const { id: transactionId, metadata, amount } = payload;
      const { orderId } = metadata;

      if (!orderId) {
        console.error('No orderId in webhook metadata');
        res.status(400).json({ error: 'Missing orderId in metadata' });
        return;
      }

      // 3. Update order payment status
      const order = await Order.findById(orderId);

      if (!order) {
        console.error(`Order not found: ${orderId}`);
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      order.payment.status = 'completed';
      order.payment.transactionId = transactionId;
      order.payment.paidAt = new Date();
      order.payment.method = 'card';
      order.payment.amount = amount / 100; // Convert cents to ZAR

      await order.save();

      console.log(`Payment completed for order ${orderId}`);

      // TODO: Send confirmation email to customer
      // await sendOrderConfirmationEmail(order);
    }

    if (type === 'payment.failed') {
      const { metadata } = payload;
      const { orderId } = metadata;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment.status = 'failed';
          await order.save();
          console.log(`Payment failed for order ${orderId}`);
        }
      }
    }

    if (type === 'refund.succeeded') {
      const { metadata } = payload;
      const { orderId } = metadata;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment.status = 'refunded';
          await order.save();
          console.log(`Refund processed for order ${orderId}`);
        }
      }
    }

    // 4. Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};