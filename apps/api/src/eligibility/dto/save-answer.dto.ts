import { IsNotEmpty, IsString } from 'class-validator';

export class SaveAnswerDto {
  @IsString()
  @IsNotEmpty()
  question_key: string;

  // Any JSON value — validated by type at the rule level
  answer_value: unknown;
}
