import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly subjectsService: SubjectsService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Cast string IDs to ObjectId for relations
    const lessonData: any = {
      ...createLessonDto,
      subject: createLessonDto.subject ? new Types.ObjectId(createLessonDto.subject) : undefined,
      competence: createLessonDto.competence ? new Types.ObjectId(createLessonDto.competence) : undefined,
      sousCompetence: createLessonDto.sousCompetence ? new Types.ObjectId(createLessonDto.sousCompetence) : undefined,
      teacher: createLessonDto.teacher ? new Types.ObjectId(createLessonDto.teacher) : undefined,
    };
    const createdLesson = new this.lessonModel(lessonData);
    return createdLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel
      .find()
      .populate('subject', 'name')
      .populate('competence', 'competence')
      .populate('sousCompetence', 'sousCompetence')
      .populate('teacher', 'username')
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

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
    files: {
      pdfs?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Handle file updates
    const existingFiles = JSON.parse(updateLessonDto.existingFiles || '[]');
    const fileUrls = [...existingFiles];

    // Add new PDF files
    if (files.pdfs) {
      for (const file of files.pdfs) {
        fileUrls.push({
          url: file.path,
          type: 'pdf',
        });
      }
    }

    // Add new video files
    if (files.videos) {
      for (const file of files.videos) {
        fileUrls.push({
          url: file.path,
          type: 'video',
        });
      }
    }

    // Update lesson
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(
        id,
        {
          ...updateLessonDto,
          fileUrls,
        },
        { new: true }
      )
      .populate('subject', 'name')
      .populate('competence', 'competence')
      .populate('sousCompetence', 'sousCompetence')
      .populate('teacher', 'username');

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