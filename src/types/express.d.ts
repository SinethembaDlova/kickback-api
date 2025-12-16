import { IUser } from '../models/User';
import { TokenPayload } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
    tokenPayload?: TokenPayload;
  }
}