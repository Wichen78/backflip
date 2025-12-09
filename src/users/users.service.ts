import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { validateTelegramWebAppData } from '../common/utils/server-checks';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // POST /users
  async createOrUpdateUser(telegramInitData: string): Promise<UserResponseDto> {
    if (!telegramInitData) {
      throw new BadRequestException('Invalid request');
    }

    const { validatedData, user: telegramUser } =
      validateTelegramWebAppData(telegramInitData);

    if (!validatedData) {
      throw new ForbiddenException('Invalid Telegram data');
    }

    const telegramId =
      process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true'
        ? process.env.USER_TEST
        : telegramUser.id?.toString();

    if (!telegramId) {
      throw new BadRequestException('Invalid user data');
    }

    try {
      let dbUser = await this.prisma.user.findUnique({ where: { telegramId } });

      if (dbUser) {
        dbUser = await this.prisma.user.update({
          where: { telegramId },
          data: {
            name: telegramUser.first_name ?? '',
            pointsBalance: dbUser.pointsBalance ?? 0,
            starsBalance: dbUser.starsBalance ?? 0,
          },
        });
      } else {
        dbUser = await this.prisma.user.create({
          data: {
            telegramId,
            name: telegramUser?.first_name ?? '',
            pointsBalance: 0,
            starsBalance: 0,
          },
        });
      }

      return new UserResponseDto(dbUser);
    } catch (error: any) {
      // Prisma unique constraint error
      if (error.code === 'P2002') {
        throw new BadRequestException('User already exists');
      }
      console.error('Error creating/updating user:', error);
      throw new InternalServerErrorException('Failed to fetch/create user');
    }
  }

  // GET /users/balance?telegramInitData=...
  async getBalance(
    telegramInitData: string,
  ): Promise<{ pointsBalance: number; starsBalance: number }> {
    const { validatedData, user: telegramUser } =
      validateTelegramWebAppData(telegramInitData);

    if (!validatedData) {
      throw new ForbiddenException('Invalid Telegram data');
    }

    const telegramId =
      process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true'
        ? process.env.USER_TEST
        : telegramUser.id?.toString();

    if (!telegramId) {
      throw new ForbiddenException('Invalid user data');
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { telegramId },
      select: {
        pointsBalance: true,
        starsBalance: true,
      },
    });

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    return dbUser;
  }

  // POST /users
  create2(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        telegramId: createUserDto.telegramId,
        name: createUserDto.name ?? null,
      },
    });
  }

  // GET /users/:telegramId
  async findByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // GET /users/:telegramId/balance
  async getBalance2(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      select: {
        pointsBalance: true,
        starsBalance: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
