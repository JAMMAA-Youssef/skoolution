import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const createdSubject = new this.subjectModel(createSubjectDto);
    return createdSubject.save();
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectModel
      .find()
      .populate('teacher', 'username email')
      .populate('lessons')
      .exec();
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectModel
      .findById(id)
      .populate('teacher', 'username email')
      .populate('lessons')
      .populate('enrolledStudents', 'username email')
      .exec();
    
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const updatedSubject = await this.subjectModel
      .findByIdAndUpdate(id, updateSubjectDto, { new: true })
      .populate('teacher', 'username email')
      .populate('lessons')
      .exec();
    
    if (!updatedSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return updatedSubject;
  }

  async remove(id: string): Promise<Subject> {
    const deletedSubject = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!deletedSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return deletedSubject;
  }

  async addLesson(subjectId: string, lessonId: string): Promise<Subject> {
    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const lessonObjectId = new Types.ObjectId(lessonId);
    if (!subject.lessons.some((id) => id.equals(lessonObjectId))) {
      subject.lessons.push(lessonObjectId);
      subject.totalLessons += 1;
      await subject.save();
    }

    return this.findOne(subjectId);
  }

  async enrollStudent(subjectId: string, studentId: string): Promise<Subject> {
    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const studentObjectId = new Types.ObjectId(studentId);
    if (!subject.enrolledStudents.some((id) => id.equals(studentObjectId))) {
      subject.enrolledStudents.push(studentObjectId);
      await subject.save();
    }

    return this.findOne(subjectId);
  }
} 