import { IsArray, ArrayNotEmpty, IsEnum, IsString } from 'class-validator';
import { AccessClaim } from '../../types';

export class UpdateAccessDto {
  @IsString()
  targetUserId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessClaim, { each: true })
  claims: AccessClaim[];
}