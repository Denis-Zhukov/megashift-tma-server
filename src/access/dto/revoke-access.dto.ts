import { IsArray, ArrayNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { AccessClaim } from '@prisma/client';

export class RevokeAccessDto {
  @IsUUID()
  targetUserId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccessClaim, { each: true })
  claims: AccessClaim[];
}
