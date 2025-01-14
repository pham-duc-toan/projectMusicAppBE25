import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  otp: string;
  @IsNotEmpty()
  passNew: string;
}
