export class UserResponseDto {
	id: string;
	telegramId: string;
	name: string | null;
	pointsBalance: number;
	starsBalance: number;

	constructor(partial: Partial<UserResponseDto>) {
		Object.assign(this, partial);
	}
}
