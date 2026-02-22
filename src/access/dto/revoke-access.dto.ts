import { IsArray, ArrayNotEmpty, IsEnum } from 'class-validator';
import { AccessClaim } from '@prisma/client';

export class RevokeAccessDto {
  targetUserId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessClaim, { each: true })
  claims: AccessClaim[];
}
