import { IsMongoId, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateProgressDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  subject: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  completedLessons?: string[];

  @IsNumber()
  @IsOptional()
  score?: number;
} 