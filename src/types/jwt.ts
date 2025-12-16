export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'technician';
}