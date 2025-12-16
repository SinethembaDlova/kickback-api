import { Request, Response, NextFunction } from 'express';
import { ITokenPayload } from '../types/jwt';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';