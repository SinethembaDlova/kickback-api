import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAddress {
  street?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}
export interface IPreferredPickupLocation {
  usePrimaryAddress: boolean;
  street?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin' | 'technician';
  address?: IAddress;
  preferredPickupLocation?: IPreferredPickupLocation;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String },
  suburb: { type: String },
  city: { type: String },
  province: { type: String },
  postalCode: { type: String }
}, { _id: false });

const PreferredPickupLocationSchema = new Schema<IPreferredPickupLocation>({
  usePrimaryAddress: { type: Boolean, default: true },
  street: { type: String },
  suburb: { type: String },
  city: { type: String },
  province: { type: String },
  postalCode: { type: String }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password by default in queries
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'technician'],
    default: 'customer'
  },
  address: {
    type: AddressSchema,
    default: {}
  },
  preferredPickupLocation: {
    type: PreferredPickupLocationSchema,
    default: { usePrimaryAddress: true }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

//Hash password before saving
UserSchema.pre<IUser>('save', async function (this: IUser) {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};