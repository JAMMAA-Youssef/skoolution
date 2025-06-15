import { IsString, IsNumber, IsOptional, IsArray, IsMongoId, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsMongoId()
  subject: string;

  @IsNumber()
  @Min(0)
  duration: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  fileUrls?: { url: string; type: 'pdf' | 'video' }[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resources?: string[];

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @IsMongoId()
  @IsOptional()
  competence?: string;

  @IsMongoId()
  @IsOptional()
  sousCompetence?: string;

  @IsMongoId()
  @IsOptional()
  teacher?: string;

  @IsString()
  @IsOptional()
  teacherName?: string;
} 