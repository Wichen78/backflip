import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'user/user.service';
import { validateTelegramWebAppData } from 'common/utils/server-checks';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class TelegramOrJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // use jwt
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      return true;
    }

    // use telegramInitData
    const initData = req.headers['x-telegram-init-data'];
    if (!initData || typeof initData !== 'string') {
      throw new UnauthorizedException('Missing Telegram init data');
    }

    const { validatedData, user: telegramUser } = validateTelegramWebAppData(initData);

    if (!validatedData) {
      throw new UnauthorizedException('Invalid Telegram init data');
    }

    let user = await this.userService.findByTelegramId(String(telegramUser.id));
    if (!user) {
      user = await this.userService.createOrUpdateUser(initData);
    }

    const payload: JwtPayload = {
      sub: user.id,
      telegramId: user.telegramId,
    };

    const token = this.jwtService.sign(payload);

    req.payload = payload;
    req.issuedJwt = token;

    return true;
  }
}
