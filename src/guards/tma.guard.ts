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
  private readonly isDev = process.env.NODE_ENV !== 'production';

  canActivate(context: ExecutionContext): boolean {
    if (this.isDev) {
      const req = context.switchToHttp().getRequest();

      req.user = this.createMockUserData();
      return true;
    }

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

    const data = deepSnakeToCamelObjKeys(parse(initData));

    req.user = data.user;

    return true;
  }

  private createMockUserData() {
    return {
      user: {
        id: 123456789,
        firstName: 'Dev',
        lastName: 'User',
        username: 'dev_user',
        languageCode: 'en',
        isPremium: true,
        allowsWriteToPm: true,
      },
      queryId: 'dev_query_id_123',
      authDate: new Date(),
      hash: 'dev_mock_hash',
    };
  }
}
