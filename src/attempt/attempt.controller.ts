import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AttemptService } from './attempt.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { AttemptResponseDto } from './dto/attempt-response.dto';

@Controller('attempts')
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {
  }

  // POST /attempts
  @Post()
  async create(@Req() req: Request, @Body() body: CreateAttemptDto): Promise<AttemptResponseDto> {
    return this.attemptService.createAttempt(
      req.payload.sub,
      body.points,
      body.stars,
    );
  }

  // GET /attempts/best
  @Get('best')
  async getBest(@Req() req: Request): Promise<AttemptResponseDto | null> {
    return this.attemptService.getBestAttempt(req.payload.sub);
  }
}
