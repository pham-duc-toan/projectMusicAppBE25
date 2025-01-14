import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RESPONE_MESSAGE = 'respone_message';

//tạo 1 decorator bằng setmetadata
export const ResponeMessage = (mess: string) => {
  return SetMetadata(RESPONE_MESSAGE, mess);
};
//tạo 1 decorator param bằng hàm createParamDecorator
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
