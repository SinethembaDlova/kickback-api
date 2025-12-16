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

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ message: 'Account is inactive. Please contact support.' });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      user: formatUserResponse(user),
      token,
      message: 'Sign in successful'
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Failed to sign in' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({ message: 'If that email exists, a verification code has been sent' });
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing codes for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Create new password reset code
    await PasswordReset.create({
      email: email.toLowerCase(),
      code
    });

    // Send email
    await sendPasswordResetEmail(email, code);

    res.status(200).json({ 
      message: 'Verification code sent to your email' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};