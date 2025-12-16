import { Request, Response, NextFunction } from 'express';
import { ITokenPayload } from '../types/jwt';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
    tokenPayload?: ITokenPayload;
  }
}