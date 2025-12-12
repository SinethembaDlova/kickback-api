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