import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }], required: true })
  questionIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'QuizTemplate', required: true })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  targetLevel: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalAttempts: number;

  @Prop({ default: 0 })
  averageScore: number;

  @Prop({ type: Number, default: 0 })
  timeLimit: number; // in minutes

  @Prop({ type: Boolean, default: false })
  isRandomized: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// Indexes
QuizSchema.index({ createdBy: 1 });
QuizSchema.index({ templateId: 1 });
QuizSchema.index({ targetLevel: 1 });

// Virtual for question count
QuizSchema.virtual('questionCount').get(function() {
  return this.questionIds.length;
}); 