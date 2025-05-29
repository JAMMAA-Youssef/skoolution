import { IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsMongoId()
  @IsOptional()
  teacher?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  lessons?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  enrolledStudents?: string[];
} 