import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SalaryType {
  HOURLY = 'HOURLY',
  SHIFT = 'SHIFT',
  MONTHLY = 'MONTHLY',
}

export class UpdateSalaryDto {
  @IsEnum(SalaryType, {
    message: 'typeSalary должен быть HOURLY, SHIFT или MONTHLY',
  })
  typeSalary: SalaryType;

  @Type(() => Number)
  @IsNumber({}, { message: 'salary должен быть числом' })
  @Min(0, { message: 'salary не может быть отрицательным' })
  salary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary должен быть числом' })
  @Min(0, { message: 'maxSalary не может быть отрицательным' })
  maxSalary: number;
}
