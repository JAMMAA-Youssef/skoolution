import { IsString, IsNumber, IsArray, IsOptional, IsIn, Min, Max, Length } from 'class-validator';
import { QuestionSource } from '../../types/schema.types';

export class CreateQuestionDto {
  @IsString()
  question: string;

  @IsNumber()
  @Min(-3)
  @Max(3)
  b: number;

  @IsArray()
  @Length(4, 4)
  @IsString({ each: true })
  choices: string[];

  @IsNumber()
  @Min(0)
  @Max(3)
  response: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  topic?: string;

  @IsIn([QuestionSource.AI, QuestionSource.MANUAL])
  source: QuestionSource;

  @IsString()
  domaine: string;

  @IsString()
  competence: string;

  @IsString()
  sousCompetence: string;
} 