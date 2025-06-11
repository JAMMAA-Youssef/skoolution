import { IsString, IsArray, IsOptional, IsMongoId, IsNumber, IsBoolean, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  lessons?: Types.ObjectId[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  enrolledStudents?: Types.ObjectId[];

  @IsMongoId()
  @IsOptional()
  teacher?: Types.ObjectId;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalLessons?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalDuration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 