import { Body, Controller, Post, Req, UseGuards, Get, Query, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class AdaptiveResponseDto {
  sessionId: string;
  questionId: string;
  response: number;
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateQuestionDto, @Req() req) {
    return this.questionsService.create({
      ...dto,
      teacher: req.user._id,
    } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async createBulk(@Body() dtos: CreateQuestionDto[], @Req() req) {
    const teacherId = req.user._id;
    const questions = dtos.map(dto => ({
      ...dto,
      teacher: teacherId,
    } as any));
    return this.questionsService.createMany(questions);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    return this.questionsService.findByTeacher(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAllPopulated() {
    return this.questionsService.findAllPopulated();
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  async testAuth(@Req() req) {
    return {
      message: 'Authentication working',
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('quiz')
  async getQuizQuestions(@Query('sousCompetenceId') sousCompetenceId: string, @Query('limit') limit: string) {
    return this.questionsService.findBySousCompetence(sousCompetenceId, Number(limit) || 20);
  }

  // ===== ADAPTIVE TESTING ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Post('adaptive/initialize')
  async initializeAdaptiveTest(
    @Body() body: { sousCompetenceId: string; maxQuestions?: number; subjectId: string },
    @Req() req
  ) {
    console.log('Adaptive initialize called with:', {
      userId: req.user._id,
      sousCompetenceId: body.sousCompetenceId,
      subjectId: body.subjectId,
      maxQuestions: 20
    });
    
    return this.questionsService.initializeAdaptiveTest(
      req.user._id,
      body.sousCompetenceId,
      body.subjectId,
      20 // Always 20 questions
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('adaptive/response')
  async submitAdaptiveResponse(@Body() dto: AdaptiveResponseDto) {
    const result = await this.questionsService.processAdaptiveResponse(
      dto.sessionId,
      dto.questionId,
      dto.response
    );

    // If test is complete, save the score
    if (result.isComplete && result.finalScore !== undefined) {
      // You can add logic here to save the final score to progress
      // This would integrate with your existing progress system
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('adaptive/session/:sessionId')
  async getAdaptiveSession(@Param('sessionId') sessionId: string) {
    const session = this.questionsService.getAdaptiveSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }
} 