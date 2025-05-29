import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

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
  phone: string;

  @IsString()
  school: string;

  @IsString()
  level: string;
} 