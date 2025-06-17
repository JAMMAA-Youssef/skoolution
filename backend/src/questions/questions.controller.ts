import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
} 