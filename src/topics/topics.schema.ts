import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export type TopicDocument = Topic & Document;

@Schema({ timestamps: true })
export class Topic {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ type: String, slug: 'title', unique: true })
  slug: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
