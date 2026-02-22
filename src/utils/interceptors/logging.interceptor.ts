import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { WinstonLogger } from '../../logger/winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const delay = Date.now() - now;

        this.logger.log(`${method} ${originalUrl} ${statusCode} - ${delay}ms`);
      }),
    );
  }
}
