//file xử lý logic decode và trả req.user của AuthGuard('jwt')
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IUser } from 'src/users/user.interface';
import { ConfigService } from '@nestjs/config';
import { RolesService } from 'src/roles/roles.service';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser) {
    const { role } = payload;
    const roleInfo = await this.rolesService.findOne(role._id);
    const listPrivate = await this.permissionsService.findAll({});

    //return ra user cho hàm handleRequest của JwtAuthGuard
    return { ...payload, permissions: roleInfo.permissions, listPrivate };
  }
}
