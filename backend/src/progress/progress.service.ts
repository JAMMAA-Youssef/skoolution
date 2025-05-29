import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>
  ) {}

  async create(createProgressDto: CreateProgressDto): Promise<Progress> {
    const createdProgress = new this.progressModel(createProgressDto);
    return createdProgress.save();
  }

  async findAll(): Promise<Progress[]> {
    return this.progressModel
      .find()
      .populate('user', 'username email')
      .populate('subject')
      .populate('completedLessons')
      .exec();
  }

  async findOne(id: string): Promise<Progress> {
    const progress = await this.progressModel
      .findById(id)
      .populate('user', 'username email')
      .populate('subject')
      .populate('completedLessons')
      .exec();
    
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async update(id: string, updateProgressDto: UpdateProgressDto): Promise<Progress> {
    const updatedProgress = await this.progressModel
      .findByIdAndUpdate(id, updateProgressDto, { new: true })
      .populate('user', 'username email')
      .populate('subject')
      .populate('completedLessons')
      .exec();
    
    if (!updatedProgress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return updatedProgress;
  }

  async remove(id: string): Promise<Progress> {
    const deletedProgress = await this.progressModel.findByIdAndDelete(id).exec();
    if (!deletedProgress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return deletedProgress;
  }

  async findByUser(userId: string): Promise<Progress[]> {
    return this.progressModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('subject')
      .populate('completedLessons')
      .exec();
  }

  async findBySubject(subjectId: string): Promise<Progress[]> {
    return this.progressModel
      .find({ subject: new Types.ObjectId(subjectId) })
      .populate('user', 'username email')
      .populate('completedLessons')
      .exec();
  }

  async addCompletedLesson(progressId: string, lessonId: string): Promise<Progress> {
    const progress = await this.progressModel.findById(progressId);
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${progressId} not found`);
    }

    const lessonIdObj = new Types.ObjectId(lessonId);
    if (!progress.completedLessons.includes(lessonIdObj)) {
      progress.completedLessons.push(lessonIdObj);
      progress.lastAccessed = new Date();
      await progress.save();
    }

    return this.findOne(progressId);
  }

  async updateScore(progressId: string, score: number): Promise<Progress> {
    const progress = await this.progressModel.findById(progressId);
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${progressId} not found`);
    }

    progress.score = score;
    progress.lastAccessed = new Date();
    await progress.save();

    return this.findOne(progressId);
  }
} 