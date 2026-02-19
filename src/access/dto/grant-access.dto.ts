import { IsArray, ArrayNotEmpty, IsEnum, IsString } from 'class-validator';
import { AccessClaim } from '../../types';

export class GrantAccessDto {
  @IsString()
  targetUserId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessClaim, { each: true })
  claims: AccessClaim[];
}
