export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'technician';
}8