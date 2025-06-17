import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    SubjectsModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService]
})
export class LessonsModule {} 