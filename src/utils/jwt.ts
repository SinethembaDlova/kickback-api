import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types/jwt';

const JWT_SECRET = (process.env.JWT_SECRET || 'your-super-secret-key-change-in-production') as string;
const envExpiration = process.env.JWT_EXPIRATION || '7d';
const JWT_EXPIRATION = envExpiration as `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRATION
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};