import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'; // Đảm bảo import đúng
@Injectable()
export class CloudinaryMultiFileUploadInterceptor implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const files = request['files'];

    if (files) {
      for (const key in files) {
        if (files[key].length > 0) {
          request.body[key] = []; // Initialize an empty array in request.body

          const array = files[key];
          for (const item of array) {
            try {
              const result =
                await this.cloudinaryService.fileToLinkOnlineCloudinary(item);
              request.body[key].push(result.secure_url);
            } catch (error) {
              console.error('Error uploading file:', error);
              // Optional: Handle error or continue
            }
          }
        }
      }
    }

    return next.handle();
  }
}
@Injectable()
export class CloudinaryFileUploadInterceptor implements NestInterceptor {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request['file'];

    if (file) {
      const result = await this.cloudinaryService.fileToLinkOnlineCloudinary(
        file,
      );
      request.body[file.fieldname] = result.secure_url;
    }

    return next.handle();
  }
}
