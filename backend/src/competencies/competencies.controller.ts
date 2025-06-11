import { Controller, Post, Body, Get } from '@nestjs/common';
import { Competency } from './schemas/competency.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCompetencyDto } from './dto/create-competency.dto';

@Controller('competencies')
export class CompetenciesController {
  constructor(
    @InjectModel(Competency.name) private competencyModel: Model<Competency>
  ) {}

  @Post()
  async create(@Body() createCompetencyDto: CreateCompetencyDto) {
    const created = new this.competencyModel(createCompetencyDto);
    return created.save();
  }

  @Get()
  async findAll() {
    return this.competencyModel.find().exec();
  }
} 