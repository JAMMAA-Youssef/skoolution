import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Progress } from './schemas/progress.schema';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  create(@Body() createProgressDto: CreateProgressDto): Promise<Progress> {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  findAll(): Promise<Progress[]> {
    return this.progressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Progress> {
    return this.progressService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<Progress> {
    return this.progressService.update(id, updateProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Progress> {
    return this.progressService.remove(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Progress[]> {
    return this.progressService.findByUser(userId);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string): Promise<Progress[]> {
    return this.progressService.findBySubject(subjectId);
  }

  @Post(':id/lessons/:lessonId')
  addCompletedLesson(
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
  ): Promise<Progress> {
    return this.progressService.addCompletedLesson(id, lessonId);
  }

  @Patch(':id/score')
  updateScore(
    @Param('id') id: string,
    @Body('score') score: number,
  ): Promise<Progress> {
    return this.progressService.updateScore(id, score);
  }
} 