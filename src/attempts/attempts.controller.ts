import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { AttemptResponseDto } from './dto/attempt-response.dto';
import { TelegramInitDataDto } from '../users/dto/telegramInitData.dto';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  //ENDPOINTS v1
  // POST /attempts
  @Post()
  async create(@Body() body: CreateAttemptDto): Promise<AttemptResponseDto> {
    return this.attemptsService.createAttempt(
      body.telegramInitData,
      body.points,
      body.stars,
    );
  }

  // GET /attempts/best?telegramInitData=...
  @Get('best')
  async getBest(
    @Query() query: TelegramInitDataDto,
  ): Promise<AttemptResponseDto | null> {
    return this.attemptsService.getBestAttempt(query.telegramInitData);
  }
}
