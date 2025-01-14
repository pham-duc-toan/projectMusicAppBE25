// src/singers/singers.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';
mongoose.plugin(slug);
export type SingerDocument = Singer & Document;

@Schema({ timestamps: true })
export class Singer {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ type: String, slug: 'fullName', unique: true })
  slug: string;

  @Prop({ default: false })
  deleted: boolean;
  @Prop()
  deletedAt: Date;
}

export const SingerSchema = SchemaFactory.createForClass(Singer);
