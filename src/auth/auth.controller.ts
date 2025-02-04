import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponeMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Request as ReqExpress, Response } from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from 'src/users/users.service';

import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { GoogleAuthGuard } from './passport/google-auth.guard';
const ms = require('ms');
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const ip = req?.ip || req.headers['x-forwarded-for'];
    console.log('User IP:', ip);
    return this.authService.login(req.user, response);
  }

  @ResponeMessage('Refresh access_token')
  @Post('refresh')
  refreshToken(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken } = body;
    return this.authService.checkTokenRefresh(refreshToken, response);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ResponeMessage('LogOut')
  logOut(
    @Req() @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logOut(req.user, response);
  }
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const accessTokenExpire = ms(process.env.JWT_ACCESS_EXPIRE || '600s'); // Mặc định 600s nếu biến không có
    const refreshTokenExpire = ms(process.env.JWT_REFRESH_EXPIRE || '1d'); // Mặc định 1d nếu biến không có

    const response = await this.authService.login(req.user);

    // Redirect về trang chủ
    return res.redirect(
      process.env.FRONTEND_URL +
        `/auth/redirect-login-google?access_token=${response.access_token}&refresh_token=${response.refresh_token}&access_expire=${accessTokenExpire}&refresh_expire=${refreshTokenExpire}`,
    );
  }
}
