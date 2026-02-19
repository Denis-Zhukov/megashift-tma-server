import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';

import { REQUIRED_CLAIMS_KEY } from '../common/require-claims.decorator';
import { AccessClaim } from '../types';

@Injectable()
export class ClaimsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredClaims = this.reflector.get<AccessClaim[]>(
      REQUIRED_CLAIMS_KEY,
      context.getHandler(),
    );

    if (!requiredClaims?.length) return true;

    const req = context.switchToHttp().getRequest();
    const consumerId: string | undefined = req.user?.id;

    if (!consumerId) {
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    }

    const ownerId = this.extractOwnerId(req);

    if (!ownerId) {
      throw new BadRequestException(
        'Не указан идентификатор владельца ресурса (ownerId)',
      );
    }

    if (ownerId === consumerId) return true;

    let hasAtLeastOne = false;

    try {
      const userClaims = await this.userService.getUserClaims(
        ownerId,
        consumerId,
      );
      req.user.claims = userClaims;
      hasAtLeastOne = requiredClaims.some((required: AccessClaim) =>
        userClaims.includes(required),
      );
    } catch {
      throw new ForbiddenException('Ошибка получения прав пользователя');
    }

    if (!hasAtLeastOne) {
      throw new ForbiddenException(`Недостаточно прав`);
    }

    return true;
  }

  private extractOwnerId(req: any): string | undefined {
    return req.query?.ownerId ?? req.params?.ownerId;
  }
}
