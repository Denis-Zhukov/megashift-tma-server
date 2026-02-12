import { IsString, IsISO8601 } from 'class-validator';

export class UpdateShiftDto {
  @IsString()
  @IsISO8601()
  actualStartTime?: string | null;

  @IsString()
  @IsISO8601()
  actualEndTime?: string | null;
}
