// src/playlist/dto/create-playlist.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SongToPlayList {
  @IsNotEmpty()
  @IsString()
  idSong: string;
}
