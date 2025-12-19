import { Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }
  
  // POST /users
  @Post()
  async create(@Req() req: Request): Promise<UserResponseDto> {
    return this.userService.findById(req.payload.sub);
  }

  // GET /users/balance
  @Get('balance')
  async getBalance(@Req() req: Request) {
    return this.userService.getBalanceById(req.payload.sub);
  }
}
