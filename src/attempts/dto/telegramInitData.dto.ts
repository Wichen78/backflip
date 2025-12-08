import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramInitDataDto {
	@IsString()
	@IsNotEmpty()
	telegramInitData: string;
}
