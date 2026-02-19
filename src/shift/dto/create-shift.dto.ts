import { IsDateString, IsUUID } from 'class-validator';

export class CreateShiftDto {
  @IsDateString({ strict: true })
  date!: string;

  @IsUUID()
  shiftTemplateId?: string;
}
