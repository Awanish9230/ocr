import jwt from 'jsonwebtoken';
import { env } from '@/src/config/env';
import mongoose from 'mongoose';

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (userId: mongoose.Types.ObjectId, role: string): string => {
  return jwt.sign({ userId: userId.toString(), role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (userId: mongoose.Types.ObjectId): string => {
  return jwt.sign({ userId: userId.toString() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};
