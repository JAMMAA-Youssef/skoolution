import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const createdLesson = new this.lessonModel(createLessonDto);
    return createdLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel
      .find()
      .populate('subject')
      .populate('completedBy', 'username email')
      .exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel
      .findById(id)
      .populate('subject')
      .populate('completedBy', 'username email')
      .exec();
    
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .populate('subject')
      .exec();
    
    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return updatedLesson;
  }

  async remove(id: string): Promise<Lesson> {
    const deletedLesson = await this.lessonModel.findByIdAndDelete(id).exec();
    if (!deletedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return deletedLesson;
  }

  async markAsCompleted(lessonId: string, userId: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const userIdObj = new Types.ObjectId(userId);
    if (!lesson.completedBy.includes(userIdObj)) {
      lesson.completedBy.push(userIdObj);
      await lesson.save();
    }

    return this.findOne(lessonId);
  }

  async findBySubject(subjectId: string): Promise<Lesson[]> {
    return this.lessonModel
      .find({ subject: new Types.ObjectId(subjectId) })
      .populate('completedBy', 'username email')
      .exec();
  }
} 