import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuestionSource } from '../../types/schema.types';

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({
    required: true,
    type: Number,
    min: -3,
    max: 3,
    validate: {
      validator: (v: number) => v >= -3 && v <= 3,
      message: 'Difficulty must be between -3 and 3'
    }
  })
  b: number;

  @Prop({
    required: true,
    type: [String],
    validate: {
      validator: (v: string[]) => v.length === 4,
      message: 'Question must have exactly 4 choices'
    }
  })
  choices: string[];

  @Prop({
    required: true,
    type: Number,
    min: 0,
    max: 3,
    validate: {
      validator: (v: number) => v >= 0 && v <= 3,
      message: 'Response must be between 0 and 3'
    }
  })
  response: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ trim: true })
  topic: string;

  @Prop({ required: true, enum: QuestionSource })
  source: QuestionSource;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  incorrectCount: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ topic: 1 });
QuestionSchema.index({ source: 1 });

// Virtual for difficulty level
QuestionSchema.virtual('difficultyLevel').get(function() {
  if (this.b < -2) return 'Very Easy';
  if (this.b < -1) return 'Easy';
  if (this.b < 0) return 'Medium-Easy';
  if (this.b < 1) return 'Medium';
  if (this.b < 2) return 'Hard';
  return 'Very Hard';
}); 