import { IsString, IsArray, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  version?: number;

  @IsString()
  @IsOptional()
  updatedBy?: string;
} 