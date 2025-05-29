import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true, minlength: 3 })
  @IsString()
  @MinLength(3)
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  @IsEmail()
  email: string;

  @Prop({ required: true, minlength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @Prop({ enum: ['student', 'teacher', 'admin'], default: 'student' })
  @IsEnum(['student', 'teacher', 'admin'])
  role: string;

  @Prop({ default: '' })
  @IsString()
  profilePicture: string;

  @Prop({ required: true })
  @IsString()
  phone: string;

  @Prop({ required: true })
  @IsString()
  school: string;

  @Prop({ required: true })
  @IsString()
  level: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }] })
  subjects: Types.ObjectId[];

  @Prop([{
    subject: { type: Types.ObjectId, ref: 'Subject' },
    completedLessons: [{ type: Types.ObjectId, ref: 'Lesson' }],
    score: { type: Number, default: 0 }
  }])
  progress: Array<{
    subject: Types.ObjectId;
    completedLessons: Types.ObjectId[];
    score: number;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User); 