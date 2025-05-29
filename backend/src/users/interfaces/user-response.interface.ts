import { Types } from 'mongoose';

export interface UserResponse {
  _id: Types.ObjectId;
  username: string;
  email: string;
  level: string;
  profilePicture: string;
  role: string;
  phone?: string;
  school?: string;
  subjects?: Types.ObjectId[];
  progress?: Array<{
    subject: Types.ObjectId;
    completedLessons: Types.ObjectId[];
    score: number;
  }>;
} 