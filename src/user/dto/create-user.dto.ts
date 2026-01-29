import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Surname is required' })
  @Transform(({ value }) => value?.trim())
  surname: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  patronymic?: string;
}
