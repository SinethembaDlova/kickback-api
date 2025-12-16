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

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: 'customer' // Default role
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Send welcome email (don't await - shouldn't block response)
    sendWelcomeEmail(user.email, user.firstName).catch(err => 
      console.error('Welcome email failed:', err)
    );

    res.status(201).json({
      user: formatUserResponse(user),
      token,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
};