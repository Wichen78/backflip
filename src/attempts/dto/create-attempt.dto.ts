import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  telegramInitData!: string;

  @IsNumber()
  @Min(0)
  points!: number;

  @IsNumber()
  @Min(0)
  stars!: number;
}
