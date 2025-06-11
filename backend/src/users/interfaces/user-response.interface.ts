import { Document, Types } from 'mongoose';

export interface UserResponse {
  _id: Types.ObjectId | string;
  username: string;
  email: string;
  level: string;
  profilePicture: string;
  role: string;
  phone?: string;
  school?: string;
  subjects?: (Types.ObjectId | string)[];
  progress?: Array<{
    subject: Types.ObjectId | string;
    completedLessons: (Types.ObjectId | string)[];
    score: number;
  }>;
} 