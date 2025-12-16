import express from 'express';
import {
  signUp,
  signIn,
  forgotPassword,
  verifyCode,
  resetPassword
} from '../controllers/auth';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

export default router;