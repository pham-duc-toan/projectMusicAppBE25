import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
const synchronizationToken = (request) => {
  const authHeader = request.headers['authorization'];
  let bearerToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7);
  }

  // Lấy access_token từ cookie
  const accessToken = request.cookies['access_token'];

  // Kiểm tra xem token có giống nhau không
  if (bearerToken && accessToken && bearerToken !== accessToken) {
    throw new UnauthorizedException('Tokens do not match');
  }
};
@Injectable()
export class ValidatorFileExistImageAndAudio implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    synchronizationToken(request);
    const files = request.files;

    const avatar = files?.avatar?.[0];
    const audio = files?.audio?.[0];

    // Kiểm tra định dạng của avatar (phải là file ảnh)
    if (!avatar || !avatar.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho avatar, phải là file ảnh hoặc thiếu',
      );
    }

    // Kiểm tra định dạng của audio (phải là file âm thanh)
    if (!audio || !audio.mimetype.startsWith('audio/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho audio, phải là file âm thanh hoặc thiếu',
      );
    }
    return next.handle(); // Cho phép tiếp tục nếu định dạng hợp lệ
  }
}
@Injectable()
export class ValidatorFileTypeImageAndAudio implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    synchronizationToken(request);
    const files = request.files;
    const avatar = files?.avatar?.[0];
    const audio = files?.audio?.[0];

    // Kiểm tra định dạng của avatar (phải là file ảnh)
    if (avatar && !avatar.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho avatar, phải là file ảnh hoặc thiếu',
      );
    }

    // Kiểm tra định dạng của audio (phải là file âm thanh)
    if (audio && !audio.mimetype.startsWith('audio/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho audio, phải là file âm thanh hoặc thiếu',
      );
    }

    return next.handle(); // Cho phép tiếp tục nếu định dạng hợp lệ
  }
}
@Injectable()
export class ValidatorFileExistImage implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    synchronizationToken(request);
    const avatar = request.file;

    // Kiểm tra định dạng của avatar (phải là file ảnh)
    if (!avatar || !avatar.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho avatar, phải là file ảnh hoặc thiếu',
      );
    }

    return next.handle(); // Cho phép tiếp tục nếu định dạng hợp lệ
  }
}
@Injectable()
export class ValidatorFileTypeImage implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    synchronizationToken(request);
    const avatar = request.file;

    // Kiểm tra định dạng của avatar (phải là file ảnh)
    if (avatar && !avatar.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ cho avatar, phải là file ảnh hoặc thiếu',
      );
    }

    return next.handle(); // Cho phép tiếp tục nếu định dạng hợp lệ
  }
}
