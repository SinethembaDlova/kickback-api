import { Request, Response } from 'express';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { generateToken } from '../utils/jwt';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email';

