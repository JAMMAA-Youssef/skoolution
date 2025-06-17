import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, BadRequestException, Put } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './schemas/lesson.schema';

function getDestination(req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, './uploads/PDFs');
  } else if (file.mimetype.startsWith('video/')) {
    cb(null, './uploads/Videos');
  } else {
    cb(new Error('Format non supporté'), null);
  }
}

function getFilename(req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + extname(file.originalname));
}

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdfs', maxCount: 10 },
    { name: 'videos', maxCount: 10 },
  ], {
    storage: diskStorage({
      destination: getDestination,
      filename: getFilename,
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Type de fichier non supporté'), false);
      }
    },
  }))
  async create(
    @UploadedFiles() files: { pdfs?: Express.Multer.File[]; videos?: Express.Multer.File[] },
    @Body() createLessonDto: CreateLessonDto
  ): Promise<Lesson> {
    const fileUrls: { url: string; type: 'pdf' | 'video' }[] = [];
    if (files.pdfs) {
      for (const file of files.pdfs) {
        fileUrls.push({ url: file.path.replace(/\\/g, '/'), type: 'pdf' });
      }
    }
    if (files.videos) {
      for (const file of files.videos) {
        fileUrls.push({ url: file.path.replace(/\\/g, '/'), type: 'video' });
      }
    }
    return this.lessonsService.create({ ...createLessonDto, fileUrls });
  }

  @Get()
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pdfs', maxCount: 10 },
      { name: 'videos', maxCount: 10 },
    ])
  )
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFiles()
    files: {
      pdfs?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    return this.lessonsService.update(id, updateLessonDto, files);
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