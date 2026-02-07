import { IsISO8601, IsUUID } from 'class-validator';

export class CreateShiftDto {
  @IsISO8601({ strict: true })
  date!: string;

  @IsUUID()
  shiftTemplateId?: string;
}
