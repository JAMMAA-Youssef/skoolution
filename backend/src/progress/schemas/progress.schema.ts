import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNumber, IsDate, IsArray } from 'class-validator';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }] })
  @IsArray()
  completedLessons: Types.ObjectId[];

  @Prop({ default: 0 })
  @IsNumber()
  score: number;

  @Prop({ default: 0 })
  @IsNumber()
  totalTimeSpent: number; // in minutes

  @Prop()
  @IsDate()
  lastAccessed: Date;

  @Prop({ default: 0 })
  @IsNumber()
  quizScore: number;

  @Prop({ default: 0 })
  @IsNumber()
  assignmentScore: number;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress); 