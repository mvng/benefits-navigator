import { IsOptional, IsString, Length } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string = 'CA';

  @IsOptional()
  @IsString()
  county?: string = 'San Diego';
}
