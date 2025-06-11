import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsMongoId, Min, Max, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class PerformanceProgressDto {
  @IsNumber()
  previousScore: number;

  @IsNumber()
  currentScore: number;

  @IsNumber()
  improvement: number;
}

class PerformanceDto {
  @IsArray()
  @IsString({ each: true })
  scoresByCompetence: string[];

  @ValidateNested()
  @Type(() => PerformanceProgressDto)
  progress: PerformanceProgressDto;

  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @IsArray()
  @IsString({ each: true })
  weaknesses: string[];
}

export class CreateEvaluationDto {
  @IsMongoId()
  studentId: Types.ObjectId;

  @IsMongoId()
  quizId: Types.ObjectId;

  @IsString()
  summary: string;

  @ValidateNested()
  @Type(() => PerformanceDto)
  performance: PerformanceDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @IsDate()
  evaluationDate: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recommendations?: string[];

  @IsBoolean()
  @IsOptional()
  isReviewed?: boolean;
} 