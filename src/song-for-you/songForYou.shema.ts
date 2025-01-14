import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';
import { Song } from 'src/songs/songs.shema';

@Schema({ timestamps: true }) // Tự động thêm `createdAt` và `updatedAt`
export class SongForYou extends Document {
  @Prop({
    type: [{ type: Types.ObjectId, ref: Song.name }],
    default: [],
  })
  listSong: Types.ObjectId[];
}

export const SongForYouSchema = SchemaFactory.createForClass(SongForYou);
