import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TSchema } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  pathName: string;

  @Prop({ required: true })
  method: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
