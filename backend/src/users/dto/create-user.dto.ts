import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsArray, ValidateIf } from 'class-validator';
import { Types } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @ValidateIf(o => o.role === UserRole.STUDENT)
  school?: string;

  @IsString()
  @ValidateIf(o => o.role === UserRole.STUDENT)
  level?: string;

  @IsString()
  @ValidateIf(o => o.role === UserRole.STUDENT)
  levels?: string[];

  @IsArray()
  @ValidateIf(o => o.role === UserRole.TEACHER)
  subjects?: Types.ObjectId[];
} 