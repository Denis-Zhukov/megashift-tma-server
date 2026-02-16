import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { AccessClaim } from '../../types';

export class CreateInviteDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Должен быть выбран хотя бы один доступ' })
  @IsEnum(AccessClaim, { each: true })
  claims: AccessClaim[];
}
