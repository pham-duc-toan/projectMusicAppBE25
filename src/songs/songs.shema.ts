import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';
import { Singer } from 'src/singers/singers.schema';
import { Topic } from 'src/topics/topics.schema';

mongoose.plugin(slug);

export type SongDocument = Song & Document;

@Schema({ timestamps: true })
export class Song {
  @Prop({ required: true })
  title: string;

  @Prop()
  avatar: string;

  @Prop()
  description: string;

  @Prop({ type: TSchema.Types.ObjectId, ref: Singer.name, required: true })
  singerId: string;

  @Prop({ type: TSchema.Types.ObjectId, ref: Topic.name, required: true })
  topicId: string;

  @Prop({ default: 0 })
  like: number;

  @Prop({ default: 0 })
  listen: number;

  @Prop()
  lyrics: string;

  @Prop({ required: true })
  audio: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ type: String, slug: 'title', unique: true })
  slug: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const SongSchema = SchemaFactory.createForClass(Song);
