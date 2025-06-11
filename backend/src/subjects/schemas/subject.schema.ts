import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsString, IsArray, IsOptional } from 'class-validator';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true, unique: true })
  @IsString()
  name: string;

  @Prop({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @Prop()
  @IsString()
  @IsOptional()
  imageUrl: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }] })
  @IsArray()
  lessons: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @IsArray()
  enrolledStudents: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacher: Types.ObjectId;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  totalDuration: number; // in minutes

  @Prop({ default: true })
  isActive: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject); 