import { SetMetadata } from '@nestjs/common';
import { AccessClaim } from '../../types';

export const REQUIRED_CLAIMS_KEY = 'required_claims';
export const RequireClaims = (...claims: AccessClaim[]) =>
  SetMetadata(REQUIRED_CLAIMS_KEY, claims);
