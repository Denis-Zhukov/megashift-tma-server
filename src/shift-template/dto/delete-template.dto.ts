import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class DeleteTemplateDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(
    ['onlyTemplate', 'templateWithShifts', 'templateWithShiftsAndEditedShifts'],
    {
      message: 'type must be either onlyTemplate, templateWithShifts or templateWithShiftsAndEditedShifts',
    },
  )
  type:
    | 'onlyTemplate'
    | 'templateWithShifts'
    | 'templateWithShiftsAndEditedShifts';
}
