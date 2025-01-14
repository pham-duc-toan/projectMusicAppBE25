import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
