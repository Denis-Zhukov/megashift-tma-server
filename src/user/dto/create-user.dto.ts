import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Surname is required' })
  @MinLength(2, { message: 'Surname must be at least 2 characters long' })
  @MaxLength(50, { message: 'Surname must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  surname: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Patronymic must be at least 2 characters long' })
  @MaxLength(50, { message: 'Patronymic must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  patronymic?: string;
}