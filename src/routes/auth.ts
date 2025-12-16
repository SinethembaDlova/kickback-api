import express from 'express';
import {
  signUp,
  signIn,
  forgotPassword,
  verifyCode,
  resetPassword,
  getMe,
  refreshToken
} from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/refresh', authenticate, refreshToken);

export default router;