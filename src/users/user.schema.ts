import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TSchema, Types } from 'mongoose';
import { PlayList } from 'src/playlist/playlist.schema';
import { Role } from 'src/roles/roles.schema';
import { Singer } from 'src/singers/singers.schema';
import { Song } from 'src/songs/songs.shema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dsi9ercdo/image/upload/v1731207669/oagc6qxabksf7lzv2wy9.jpg',
  })
  avatar: string;

  @Prop({ type: Types.ObjectId, ref: Role.name })
  role: Types.ObjectId;

  @Prop({ required: true, enum: ['SYSTEM', 'GITHUB', 'GOOGLE'] })
  type: string;

  @Prop()
  refreshToken: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: PlayList.name }],
    default: [],
  })
  listPlaylist: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: Song.name }],
    default: [],
  })
  listFavoriteSong: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Singer.name, required: false }) // Không bắt buộc
  singerId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
