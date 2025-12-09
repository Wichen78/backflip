import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  telegramId!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
