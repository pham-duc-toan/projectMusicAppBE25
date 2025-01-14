import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Tự động thêm `createdAt` và `updatedAt`
export class ForgotPassword extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({
    type: Date,
    required: true,
    expires: 180, // Sau 180 giây (3 phút), tài liệu sẽ tự động bị xóa
  })
  expiredAt: Date;
}

export const ForgotPasswordSchema =
  SchemaFactory.createForClass(ForgotPassword);
