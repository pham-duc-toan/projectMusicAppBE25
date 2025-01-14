import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Song } from 'src/songs/songs.shema';

export type PlayListDocument = PlayList & Document;

@Schema({ timestamps: true })
export class PlayList {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) // Sử dụng Types.ObjectId
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Song.name }],
    default: [],
  })
  listSong: Types.ObjectId[];

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const PlayListSchema = SchemaFactory.createForClass(PlayList);
