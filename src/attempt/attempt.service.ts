import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AttemptResponseDto } from './dto/attempt-response.dto';

@Injectable()
export class AttemptService {
  constructor(private readonly prisma: PrismaService) {
  }

  // POST /attempts
  async createAttempt(
    userId: string,
    points: number,
    stars: number,
  ): Promise<AttemptResponseDto> {
    if (isNaN(points) || isNaN(stars)) {
      throw new BadRequestException('Invalid request');
    }

    try {
      const attempt = await this.prisma.$transaction(async (prismaTx) => {
        const user = await prismaTx.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const newAttempt = await prismaTx.attempt.create({
          data: {
            points,
            stars,
            authorId: user.id,
          },
        });

        await prismaTx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: { increment: points },
            starsBalance: { increment: stars },
          },
        });

        return newAttempt;
      });

      return new AttemptResponseDto(attempt);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating attempt:', error);
      throw new InternalServerErrorException('Failed to fetch/create attempt');
    }
  }

  // GET /attempts/best
  async getBestAttempt(userId: string): Promise<AttemptResponseDto | null> {
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        throw new NotFoundException('User not found');
      }

      const bestAttempt = await this.prisma.attempt.findFirst({
        where: { authorId: dbUser.id },
        orderBy: { points: 'desc' },
      });

      return bestAttempt ? new AttemptResponseDto(bestAttempt) : null;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching best attempt:', error);
      throw new InternalServerErrorException('Failed to fetch best attempt');
    }
  }
}
