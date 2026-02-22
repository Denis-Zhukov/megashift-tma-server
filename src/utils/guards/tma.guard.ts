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

  constructor(private readonly excludePaths: string[] = []) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.isDev) {
      const req = context.switchToHttp().getRequest();

      req.user = this.createMockUserData();
      return true;
    }

    const req = context.switchToHttp().getRequest();

    if (this.excludePaths.includes(req.path)) {
      return true;
    }

    const auth: string = req.headers['authorization'];

    if (!auth) {
      throw new UnauthorizedException('Вы вошли не из telegram mini app');
    }

    if (!auth.startsWith('tma ')) {
      throw new UnauthorizedException('Вы вошли не из telegram mini app');
    }

    const initData = auth.replace(/^tma\s/, '');

    if (!isValid(initData, this.BOT_TOKEN)) {
      throw new UnauthorizedException('Invalid Token');
    }

    const data = deepSnakeToCamelObjKeys(parse(initData));

    req.user = {
      ...data.user,
      id: String(data.user.id),
    };

    return true;
  }

  private createMockUserData() {
    return {
      allowsWriteToPm: true,
      firstName: 'Denis',
      id: '1160368886',
      isPremium: true,
      lastName: 'Zhukov',
      languageCode: 'ru',
      photoUrl:
        'https://t.me/i/userpic/320/pIgDdBcvL0ik_M-UrvDiZCtYWx1En2v5aFu3KTpzzDc.svg',
      username: 'Denis_Zhukov_Hachiko',
    };
  }
}
