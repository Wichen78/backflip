import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { TelegramOrJwtGuard } from './auth/guards/telegram-or-jwt.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtResponseInterceptor } from './auth/interceptors/jwt-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalGuards(
    app.get(TelegramOrJwtGuard),
    app.get(JwtAuthGuard),
  );

  app.useGlobalInterceptors(
    app.get(JwtResponseInterceptor),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap();
