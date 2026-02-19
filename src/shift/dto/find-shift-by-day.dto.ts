import { IsDateString } from 'class-validator';

export class FindShiftByDayDto {
  @IsDateString({ strict: true })
  date: string;
}
