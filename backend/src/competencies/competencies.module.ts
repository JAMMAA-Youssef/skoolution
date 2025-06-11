import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Competency, CompetencySchema } from './schemas/competency.schema';
import { CompetenciesController } from './competencies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Competency.name, schema: CompetencySchema }
    ])
  ],
  controllers: [CompetenciesController],
})
export class CompetenciesModule {} 