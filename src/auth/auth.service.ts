import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  //check tk mk
  async validateUser(username: string, pass: string): Promise<any> {
    return this.usersService.checkUserLogin(username, pass);
  }
  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    });
    return refresh_token;
  };
  checkTokenRefresh = async (refreshToken: string, response?: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user: any = await this.usersService.findByTokenRefresh(
        refreshToken,
      );

      if (user) {
        const { _id, avatar, fullName, username, type, role, singerId } = user;

        // Tạo payload cho JWT, thêm singerId nếu tồn tại
        const payload: any = {
          sub: 'token login',
          iss: 'from server',
          _id,
          fullName,
          username,
          avatar,
          role,
          type,
        };

        if (singerId) {
          payload.singerId = singerId;
        }

        const refresh_token = this.createRefreshToken(payload);
        await this.usersService.updateTokenRefresh(refresh_token, _id);

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token,
          user: {
            _id,
            fullName,
            username,
            type,
            role,
            avatar,
            ...(singerId && { singerId }), // Thêm singerId vào user nếu tồn tại
          },
        };
      }

      throw new BadRequestException(
        'Refresh token không hợp lệ. Vui lòng login lại',
      );
    } catch (error) {
      throw new BadRequestException(
        'Refresh token không hợp lệ. Vui lòng login lại',
      );
    }
  };

  async login(user, response?: Response) {
    const { _id, fullName, username, role, avatar, type, singerId } = user;

    // Payload cho Refresh Token (Không cần singerId trong refresh token)
    const payloadRefreshToken = {
      sub: 'token login',
      iss: 'from server',
      username,
      type,
    };

    // Payload cho Access Token, thêm singerId nếu có
    const payloadAccessToken: any = {
      sub: 'token login',
      iss: 'from server',
      _id,
      fullName,
      username,
      role,
      avatar,
      type,
    };

    // Nếu user có singerId, thêm vào payloadAccessToken
    if (singerId) {
      payloadAccessToken.singerId = singerId;
    }

    const refresh_token = this.createRefreshToken(payloadRefreshToken);
    const access_token = this.jwtService.sign(payloadAccessToken);

    // Cập nhật refresh token vào cơ sở dữ liệu
    await this.usersService.updateTokenRefresh(refresh_token, _id);

    return {
      access_token,
      refresh_token,
      user: {
        _id,
        fullName,
        username,
        role,
        avatar,
        type,
        ...(singerId && { singerId }), // Thêm singerId vào user nếu có
      },
    };
  }

  logOut = async (user: IUser, response: Response) => {
    await this.usersService.updateTokenRefresh('', user._id);
    response.clearCookie('refresh_token');

    return {
      status: 'Logout success',
    };
  };
  async validateGoogleUser(googleUser: any) {
    const user = await this.usersService.findOneByEmailGoogle(googleUser.email);
    if (user) return user;
    return await this.usersService.createOAuthGoogle(googleUser);
  }
}
