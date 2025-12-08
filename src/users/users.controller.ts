import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TelegramInitDataDto } from 'src/users/dto/telegramInitData.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// Endpoints v1
	// POST /users
	@Post()
	async create(@Body() body: TelegramInitDataDto): Promise<UserResponseDto> {
		return this.usersService.createOrUpdateUser(body.telegramInitData);
	}

	// GET /users/balance?telegramInitData=...
	@Get('balance')
	async getBalance(@Query() query: TelegramInitDataDto) {
		return this.usersService.getBalance(query.telegramInitData);
	}

	// Endpoints v2
	// POST /users/users
	@Post('/users')
	create2(@Body() dto: CreateUserDto) {
		return this.usersService.create2(dto);
	}

	// GET /users/:telegramId
	@Get(':telegramId')
	findByTelegramId(@Param('telegramId') telegramId: string) {
		return this.usersService.findByTelegramId(telegramId);
	}

	// GET /users/:telegramId/balance
	@Get(':telegramId/balance')
	getBalance2(@Param('telegramId') telegramId: string) {
		return this.usersService.getBalance2(telegramId);
	}
}
