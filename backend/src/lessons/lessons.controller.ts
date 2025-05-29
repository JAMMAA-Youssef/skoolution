import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './schemas/lesson.schema';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.remove(id);
  }

  @Post(':id/complete/:userId')
  markAsCompleted(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<Lesson> {
    return this.lessonsService.markAsCompleted(id, userId);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string): Promise<Lesson[]> {
    return this.lessonsService.findBySubject(subjectId);
  }
} 