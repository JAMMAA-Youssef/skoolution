import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  @IsString()
  title: string;

  @Prop({ required: true })
  @IsString()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject: Types.ObjectId;

  @Prop({ default: 0 })
  @IsNumber()
  duration: number; // in minutes

  @Prop({ default: 0 })
  @IsNumber()
  order: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @IsArray()
  completedBy: Types.ObjectId[];

  @Prop()
  @IsString()
  @IsOptional()
  videoUrl: string;

  @Prop()
  @IsString()
  @IsOptional()
  resources: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  @IsNumber()
  difficulty: number; // 1-5 scale
}

export const LessonSchema = SchemaFactory.createForClass(Lesson); 