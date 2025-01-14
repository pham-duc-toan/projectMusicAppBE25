import { Controller, Post, Body } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post('request')
  async requestOtp(@Body() createForgotPasswordDto: CreateForgotPasswordDto) {
    return this.forgotPasswordService.create(createForgotPasswordDto);
  }

  @Post('verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.forgotPasswordService.verifyOtp(verifyOtpDto);
  }
}
