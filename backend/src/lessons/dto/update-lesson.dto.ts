import { IsString, IsNumber, IsOptional, IsArray, IsMongoId, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsMongoId()
  @IsOptional()
  subject?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

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

  @IsString()
  @IsOptional()
  existingFiles?: string;
} 