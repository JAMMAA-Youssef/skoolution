import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './schemas/subject.schema';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Subject> {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Subject> {
    return this.subjectsService.remove(id);
  }

  @Post(':id/lessons/:lessonId')
  addLesson(
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
  ): Promise<Subject> {
    return this.subjectsService.addLesson(id, lessonId);
  }

  @Post(':id/students/:studentId')
  enrollStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ): Promise<Subject> {
    return this.subjectsService.enrollStudent(id, studentId);
  }
} 