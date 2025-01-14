import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Thêm tùy chọn timestamps để tự động thêm createdAt và updatedAt
export class Order extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  resultCode: string;

  @Prop({ type: String, enum: ['init', 'done'], default: 'init' })
  status: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  shortLink: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
