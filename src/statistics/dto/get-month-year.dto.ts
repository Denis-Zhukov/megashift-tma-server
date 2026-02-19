import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthYearDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;
}