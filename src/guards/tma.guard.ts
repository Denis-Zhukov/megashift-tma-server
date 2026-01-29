import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  deepSnakeToCamelObjKeys,
  isValid,
  parse,
} from '@tma.js/init-data-node';

@Injectable()
export class TmaGuard implements CanActivate {
  private readonly BOT_TOKEN = process.env.BOT_TOKEN!;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];

    if (!auth) {
      throw new UnauthorizedException('No Authorization header');
    }

    if (!auth.startsWith('tma ')) {
      throw new UnauthorizedException('Not a TMA token');
    }

    const initData = auth.replace(/^tma\s/, '');

    if (!isValid(initData, this.BOT_TOKEN)) {
      throw new UnauthorizedException('Invalid Token');
    }

    req.user = deepSnakeToCamelObjKeys(parse(initData));

    return true;
  }
}
