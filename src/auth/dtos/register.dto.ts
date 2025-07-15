import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  IsString,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  first_name?: string;

  @IsString()
  last_name?: string;

  @IsString()
  education_level?: string;

  @IsInt()
  @Min(0)
  experience_years?: number;

  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
