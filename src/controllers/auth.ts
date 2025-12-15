import { Request, Response } from 'express';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { generateToken } from '../utils/jwt';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email';

// Helper to format user response (exclude password)
const formatUserResponse = (user: any) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: user.role,
  address: user.address || {},
  preferredPickupLocation: user.preferredPickupLocation || { usePrimaryAddress: true },
  emailVerified: user.emailVerified,
  createdAt: user.createdAt
});