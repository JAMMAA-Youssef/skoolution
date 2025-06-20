import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdaptiveQuizAnalyticsService } from './adaptive-quiz-analytics.service';

@Controller('adaptive-quiz')
@UseGuards(JwtAuthGuard)
export class AdaptiveQuizController {
  constructor(private readonly analyticsService: AdaptiveQuizAnalyticsService) {}

  @Get('analytics/:sessionId')
  async getAnalyticsReport(@Param('sessionId') sessionId: string) {
    return this.analyticsService.generateAnalyticsReport(sessionId);
  }

  @Get('student-progress/:userId')
  async getStudentProgress(
    @Param('userId') userId: string,
    @Query('sousCompetenceId') sousCompetenceId?: string
  ) {
    // This will be implemented to show student's progress over time
    return { message: 'Student progress endpoint - to be implemented' };
  }

  @Get('class-analytics/:sousCompetenceId')
  async getClassAnalytics(@Param('sousCompetenceId') sousCompetenceId: string) {
    // This will be implemented to show class-wide analytics
    return { message: 'Class analytics endpoint - to be implemented' };
  }
} 