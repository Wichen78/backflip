export class AttemptResponseDto {
  id!: string;
  points!: number;
  stars!: number;
  authorId!: string | null;

  constructor(partial: Partial<AttemptResponseDto>) {
    Object.assign(this, partial);
  }
}
