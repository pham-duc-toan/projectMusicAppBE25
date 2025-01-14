// src/playlist/playlist.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  BadRequestException,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { PlayList } from './playlist.schema';
import { UserService } from 'src/users/users.service';
import { SongToPlayList } from './dto/add-song-to-playlist.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async create(
    @Body() createPlaylistDto: CreatePlaylistDto,
  ): Promise<PlayList> {
    if (createPlaylistDto.listSong) {
      createPlaylistDto.listSong = [];
    }

    return this.playlistService.createPlaylist(createPlaylistDto);
  }
  @Get()
  async findAll(): Promise<PlayList[]> {
    return this.playlistService.findAll(); // Gọi service để lấy tất cả playlists
  }
  @Get('findOne/:id')
  async findOne(@Param('id') id: string): Promise<PlayList> {
    return this.playlistService.findOne(id); // Gọi service để lấy tất cả playlists
  }
  //tra ra 1 list cac playlist của 1 user
  @UseGuards(JwtAuthGuard)
  @Get('detail')
  async detail(@Request() req) {
    return this.playlistService.detail(req.user._id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('addSong/:id')
  async addSong(
    @Body() idSong: SongToPlayList,
    @Param('id') idListSong: string,
    @Request() req,
  ) {
    return this.playlistService.addSong(idSong, idListSong, req.user._id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('removeSong/:id')
  async removeSong(
    @Body() idSong: SongToPlayList,
    @Param('id') idListSong: string,
    @Request() req,
  ) {
    return this.playlistService.removeSong(idSong, idListSong, req.user._id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const listPlaylist = await this.playlistService.detail(req.user._id);

    const exists = listPlaylist.some(
      (playlist) => playlist._id.toString() === id,
    );

    if (exists) {
      await this.playlistService.remove(id, req.user._id);
    } else {
      return {
        message: `Bạn không phải người tạo playlist nên ko có quyền xóa`,
      };
    }

    return { message: `Playlist với id ${id} đã được xóa thành công` };
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async edit(
    @Param('id') id: string,
    @Body() body: UpdatePlaylistDto,
    @Request() req,
  ): Promise<{ message: string }> {
    const listPlaylist = await this.playlistService.detail(req.user._id);

    const exists = listPlaylist.some(
      (playlist) => playlist._id.toString() === id,
    );

    if (exists) {
      await this.playlistService.edit(id, body);
    } else {
      return {
        message: `Bạn không phải người tạo playlist nên ko có quyền sửa`,
      };
    }

    return { message: `Playlist với id ${id} đã được update thành công` };
  }
}
