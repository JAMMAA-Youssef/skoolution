import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IQuizResponse } from '../../types/schema.types';

@Schema({ timestamps: true })
export class StudentQuiz extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ required: true, type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  submittedAt: Date;

  @Prop({
    type: [{
      questionId: { type: MongooseSchema.Types.ObjectId, ref: 'Question' },
      selectedIndex: { type: Number, min: 0, max: 3 },
      isCorrect: Boolean
    }],
    required: true
  })
  responses: IQuizResponse[];

  @Prop({ type: Number, default: 0 })
  timeSpent: number; // in seconds

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Number, default: 0 })
  correctAnswers: number;

  @Prop({ type: Number, default: 0 })
  incorrectAnswers: number;
}

export const StudentQuizSchema = SchemaFactory.createForClass(StudentQuiz);

// Indexes
StudentQuizSchema.index({ studentId: 1, quizId: 1 });
StudentQuizSchema.index({ startedAt: 1 });
StudentQuizSchema.index({ score: 1 });

// Virtual for completion time
StudentQuizSchema.virtual('completionTime').get(function() {
  if (!this.submittedAt || !this.startedAt) return null;
  return (this.submittedAt.getTime() - this.startedAt.getTime()) / 1000; // in seconds
}); 