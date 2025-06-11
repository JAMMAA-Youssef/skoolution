import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsMongoId, Min, Max } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCompetencyDto {
  @IsMongoId()
  domaine: Types.ObjectId;

  @IsString()
  competence: string;

  @IsString()
  sousCompetence: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  level?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
} 