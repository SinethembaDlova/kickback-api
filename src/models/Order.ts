import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment {
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method?: 'card' | 'eft';
  transactionId?: string;
  paidAt?: Date;
  amount: number;
  currency: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  serviceTier: 'bronze' | 'silver' | 'gold';
  beforePhotos: string[];
  afterPhotos: string[];
  pickupDate: Date;
  pickupTime: string;
  deliveryAddress: string;
  status: 'submitted' | 'picked-up' | 'cleaning' | 'ready' | 'delivered';
  price: number;
  payment: IPayment;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['card', 'eft']
  },
  transactionId: {
    type: String
  },
  paidAt: {
    type: Date
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ZAR'
  }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  serviceTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold'],
    required: [true, 'Service tier is required']
  },
  beforePhotos: {
    type: [String],
    default: []
  },
  afterPhotos: {
    type: [String],
    default: []
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  pickupTime: {
    type: String,
    required: [true, 'Pickup time is required']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  status: {
    type: String,
    enum: ['submitted', 'picked-up', 'cleaning', 'ready', 'delivered'],
    default: 'submitted'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  payment: {
    type: PaymentSchema,
    required: true
  },
  estimatedDelivery: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'payment.status': 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);