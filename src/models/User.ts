import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Analyst' | 'User';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false }, // don't return password by default
    role: {
      type: String,
      enum: ['Admin', 'Analyst', 'User'],
      default: 'User',
    },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Prevent mongoose from compiling the model multiple times in development
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
