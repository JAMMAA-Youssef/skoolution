import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { AdaptiveQuizSession, AdaptiveQuizSessionSchema } from '../adaptive-quiz/schemas/adaptive-quiz-session.schema';
import { AdaptiveQuizAnalyticsService } from '../adaptive-quiz/adaptive-quiz-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: AdaptiveQuizSession.name, schema: AdaptiveQuizSessionSchema }
    ])
  ],
  providers: [QuestionsService, AdaptiveQuizAnalyticsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {} 