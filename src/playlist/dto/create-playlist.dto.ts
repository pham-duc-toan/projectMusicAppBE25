// src/playlist/dto/create-playlist.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsArray()
  @IsOptional()
  listSong?: string[];
}
