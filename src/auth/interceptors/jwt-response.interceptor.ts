import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class JwtResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const res = ctx.switchToHttp().getResponse();
    const req = ctx.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        if (req.issuedJwt) {
          res.setHeader('X-Auth-Token', req.issuedJwt);
        }
      }),
    );
  }
}
