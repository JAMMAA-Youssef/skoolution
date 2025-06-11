import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IEvaluationPerformance } from '../../types/schema.types';

@Schema({ timestamps: true })
export class Evaluation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({
    type: {
      scoresByCompetence: { type: Map, of: Number },
      progress: {
        previousScore: Number,
        currentScore: Number,
        improvement: Number
      },
      strengths: [String],
      weaknesses: [String]
    },
    required: true
  })
  performance: IEvaluationPerformance;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  overallScore: number;

  @Prop({ type: Date, required: true })
  evaluationDate: Date;

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @Prop({ type: Boolean, default: false })
  isReviewed: boolean;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);

// Indexes
EvaluationSchema.index({ studentId: 1, quizId: 1 });
EvaluationSchema.index({ evaluationDate: 1 });
EvaluationSchema.index({ overallScore: 1 });

// Virtual for performance trend
EvaluationSchema.virtual('performanceTrend').get(function() {
  const progress = this.performance.progress;
  if (progress.improvement > 0) return 'improving';
  if (progress.improvement < 0) return 'declining';
  return 'stable';
}); 