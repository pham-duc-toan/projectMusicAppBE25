//file cấu hình chung của AuthGuard('jwt')
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  // khi nào mà dùng decorator hoặc dùng global decorator guard jwt thì chạy vào canactivate trước
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
    //nếu return super.canActivate(context) thì sẽ chạy vào JwtStrategy để thực hiện logic
  }
  //sau khi chạy vào JwtStrategy rồi thì chạy xuống hàm handleRequest
  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    if (err || !user) {
      throw err || new UnauthorizedException('token không hợp lệ hoặc hết hạn');
    }
    //các route cần kiểm tra role
    const privateRouter = user.listPrivate;

    const targetMethod = request.method;
    const targetEndpoint = request.route?.path;

    // Kiểm tra xem targetMethod và targetEndpoint có thuộc privateRouter không
    const isPrivateRoute = privateRouter.some(
      (route) =>
        route.method === targetMethod && route.pathName === targetEndpoint,
    );

    // Nếu là private route, kiểm tra quyền truy cập của user
    if (isPrivateRoute) {
      const permissions = user.permissions || [];

      const isExist = permissions.find(
        (permission) =>
          targetMethod === permission.method &&
          targetEndpoint === permission.pathName,
      );

      if (!isExist) {
        throw new ForbiddenException('Bạn không có quyền này!');
      }
    }

    return user; // Gán user vào req.user
  }
}
