import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdaptiveQuizSession, AdaptiveQuizSessionSchema } from './schemas/adaptive-quiz-session.schema';
import { AdaptiveQuizAnalyticsService } from './adaptive-quiz-analytics.service';
import { AdaptiveQuizController } from './adaptive-quiz.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdaptiveQuizSession.name, schema: AdaptiveQuizSessionSchema }
    ])
  ],
  controllers: [AdaptiveQuizController],
  providers: [AdaptiveQuizAnalyticsService],
  exports: [AdaptiveQuizAnalyticsService]
})
export class AdaptiveQuizModule {} 