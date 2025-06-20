import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface QuestionResponse {
  questionId: Types.ObjectId;
  difficulty: number;
  studentResponse: number;
  correct: boolean;
  abilityBefore: number;
  abilityAfter: number;
  questionNumber: number;
  timeSpent?: number; // seconds
}

export interface PerformanceByDifficulty {
  easy: { correct: number; total: number };
  medium: { correct: number; total: number };
  hard: { correct: number; total: number };
}

export interface LearningPattern {
  consistency: number; // 0-1, how consistent performance was
  optimalChallengeZone: number; // difficulty level where student performs best
  learningEfficiency: number; // how quickly ability estimate stabilized
  engagementLevel: number; // based on response patterns
}

@Schema({ timestamps: true })
export class AdaptiveQuizSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: String, required: true })
  sousCompetenceId: string;

  @Prop({ required: true })
  sessionId: string;

  // Basic Quiz Info
  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ default: 0 })
  totalDuration: number; // seconds

  // Final Results
  @Prop({ required: true, min: 0, max: 20 })
  finalScore: number; // out of 20

  @Prop({ required: true })
  finalAbility: number; // 1PL ability estimate

  @Prop({ required: true })
  standardError: number; // confidence in ability estimate

  @Prop({ required: true, enum: ['Débutant', 'Intermédiaire', 'Moyen', 'Avancé', 'Expert'] })
  abilityLevel: string;

  // Question-by-Question Data
  @Prop({ type: [Object], required: true })
  responses: QuestionResponse[];

  @Prop({ type: [Number], required: true })
  abilityProgression: number[]; // 20 data points

  // Performance Analytics
  @Prop({ type: Object, required: true })
  performanceByDifficulty: PerformanceByDifficulty;

  @Prop({ type: Object })
  learningPattern: LearningPattern;

  // Historical Context
  @Prop({ default: 0 })
  previousAbility: number;

  @Prop({ default: 0 })
  abilityImprovement: number;

  @Prop({ default: 1 })
  attemptsCount: number;

  // Algorithm Performance
  @Prop({ type: [Number] })
  questionSelectionEffectiveness: number[]; // how well each question was chosen

  @Prop({ type: [Number] })
  informationGain: number[]; // how much each question contributed

  // Comparative Analytics
  @Prop({ default: 0 })
  classAverageAbility: number;

  @Prop({ default: 0 })
  percentileRank: number; // 0-100

  // Metadata
  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: false })
  isAbandoned: boolean;

  @Prop()
  abandonmentReason?: string;

  // Version tracking for algorithm improvements
  @Prop({ default: '1.0' })
  algorithmVersion: string;
}

export const AdaptiveQuizSessionSchema = SchemaFactory.createForClass(AdaptiveQuizSession);

// Indexes for efficient querying
AdaptiveQuizSessionSchema.index({ userId: 1, sousCompetenceId: 1 });
AdaptiveQuizSessionSchema.index({ userId: 1, startTime: -1 });
AdaptiveQuizSessionSchema.index({ sousCompetenceId: 1, startTime: -1 });
AdaptiveQuizSessionSchema.index({ finalAbility: 1 });
AdaptiveQuizSessionSchema.index({ isCompleted: 1 }); 