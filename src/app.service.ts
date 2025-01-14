import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    throw new BadRequestException('Toandeptrai');
  }
}
