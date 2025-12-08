import { Injectable, BadRequestException, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { validateTelegramWebAppData } from 'src/common/utils/server-checks';
import { AttemptResponseDto } from './dto/attempt-response.dto';

@Injectable()
export class AttemptsService {
	constructor(private readonly prisma: PrismaService) {}

	// POST /attempts
	async createAttempt(telegramInitData: string, points: number, stars: number): Promise<AttemptResponseDto> {
		if (!telegramInitData || isNaN(points) || isNaN(stars)) {
			throw new BadRequestException('Invalid request');
		}

		const { validatedData, user: telegramUser } = validateTelegramWebAppData(telegramInitData);

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
			const attempt = await this.prisma.$transaction(async (prismaTx) => {
				const dbUser = await prismaTx.user.findUnique({ where: { telegramId } });

				if (!dbUser) {
					throw new NotFoundException('User not found');
				}

				const newAttempt = await prismaTx.attempt.create({
					data: {
						points,
						stars,
						authorId: dbUser.id,
					},
				});

				await prismaTx.user.update({
					where: { id: dbUser.id },
					data: {
						pointsBalance: { increment: points },
						starsBalance: { increment: stars },
					},
				});

				return newAttempt;
			});

			return new AttemptResponseDto(attempt);
		} catch (error: any) {
			console.error('Error creating attempt:', error);
			throw new InternalServerErrorException('Failed to fetch/create attempt');
		}
	}

	// GET /attempts/best
	async getBestAttempt(telegramInitData: string): Promise<AttemptResponseDto | null> {
		if (!telegramInitData) {
			throw new BadRequestException('Invalid request');
		}

		const { validatedData, user: telegramUser } = validateTelegramWebAppData(telegramInitData);

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
			const dbUser = await this.prisma.user.findUnique({ where: { telegramId } });

			if (!dbUser) {
				throw new NotFoundException('User not found');
			}

			const bestAttempt = await this.prisma.attempt.findFirst({
				where: { authorId: dbUser.id },
				orderBy: { points: 'desc' },
			});

			return bestAttempt ? new AttemptResponseDto(bestAttempt) : null;
		} catch (error) {
			console.error('Error fetching best attempt:', error);
			throw new InternalServerErrorException('Failed to fetch best attempt');
		}
	}
}
