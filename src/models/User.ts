import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAddress {
  street?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}-