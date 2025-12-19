import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';
import { TelegramOrJwtGuard } from './guards/telegram-or-jwt.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtResponseInterceptor } from './interceptors/jwt-response.interceptor';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UserModule,
  ],
  providers: [
    JwtStrategy,
    TelegramOrJwtGuard,
    JwtAuthGuard,
    JwtResponseInterceptor,
  ],
  exports: [
    TelegramOrJwtGuard,
    JwtAuthGuard,
    JwtResponseInterceptor,
  ],
})
export class AuthModule {}
