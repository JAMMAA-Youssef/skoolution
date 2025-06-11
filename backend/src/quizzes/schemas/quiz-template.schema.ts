import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IQuizTemplateCriteria } from '../../types/schema.types';

@Schema({ timestamps: true })
export class QuizTemplate extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: {
      difficulty: {
        min: { type: Number, min: -3, max: 3 },
        max: { type: Number, min: -3, max: 3 }
      },
      bloomLevel: [String],
      domain: [String],
      topic: [String]
    },
    required: true
  })
  criteria: IQuizTemplateCriteria;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 10 })
  questionCount: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const QuizTemplateSchema = SchemaFactory.createForClass(QuizTemplate);

// Indexes
QuizTemplateSchema.index({ createdBy: 1 });
QuizTemplateSchema.index({ tags: 1 });
QuizTemplateSchema.index({ 'criteria.difficulty.min': 1, 'criteria.difficulty.max': 1 });

// Method to validate difficulty range
QuizTemplateSchema.methods.validateDifficultyRange = function() {
  return this.criteria.difficulty.min <= this.criteria.difficulty.max;
}; 