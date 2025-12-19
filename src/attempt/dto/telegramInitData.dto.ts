import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramInitDataDto {
  @IsString()
  @IsNotEmpty()
  telegramInitData!: string;
}
