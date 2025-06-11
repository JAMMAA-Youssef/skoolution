import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../types/schema.types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: false, trim: true })
  name?: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class' })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  filiere?: string;

  @Prop({ required: false })
  niveau?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop({ required: true, unique: true, trim: true, minlength: 3 })
  @IsString()
  @MinLength(3)
  username: string;

  @Prop({ default: '' })
  @IsString()
  profilePicture: string;

  @Prop()
  @IsString()
  phone: string;

  @Prop()
  @IsString()
  school: string;

  @Prop({ type: [String], default: [] })
  levels: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Subject' }] })
  subjects: MongooseSchema.Types.ObjectId[];

  @Prop([{
    subject: { type: MongooseSchema.Types.ObjectId, ref: 'Subject' },
    completedLessons: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }],
    score: { type: Number, default: 0 }
  }])
  progress: Array<{
    subject: MongooseSchema.Types.ObjectId;
    completedLessons: MongooseSchema.Types.ObjectId[];
    score: number;
  }>;

  @Prop({ required: false })
  city?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ classId: 1 });
UserSchema.index({ role: 1 }); 