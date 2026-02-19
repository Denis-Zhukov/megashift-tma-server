import { IsDateString } from 'class-validator';

export class FindShiftByDayDto {
  @IsDateString()
  date: string;
}
