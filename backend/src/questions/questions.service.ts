import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = new this.questionModel(createQuestionDto);
    return question.save();
  }

  async createMany(createQuestionDtos: CreateQuestionDto[]) {
    return this.questionModel.insertMany(createQuestionDtos);
  }

  async findByTeacher(teacherId: string) {
    return this.questionModel.find({ teacher: teacherId })
      .populate('competence')
      .populate('domaine');
  }

  async findAllPopulated() {
    return this.questionModel.find()
      .populate('competence')
      .populate('domaine');
  }

  async findBySousCompetence(sousCompetenceId: string, limit: number = 20) {
    return this.questionModel.find({ competence: sousCompetenceId }).limit(limit);
  }
} 