// src/playlist/playlist.service.ts
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, ObjectId, Types } from 'mongoose';
import { PlayList } from './playlist.schema';

import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UserService } from 'src/users/users.service';
import { SongToPlayList } from './dto/add-song-to-playlist.dto';
import { SongsService } from 'src/songs/songs.service';
import { Song } from 'src/songs/songs.shema';
@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel(PlayList.name) private playlistModel: Model<PlayList>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => SongsService))
    private readonly songService: SongsService,
  ) {}
  async findAll(): Promise<PlayList[]> {
    return this.playlistModel
      .find()
      .populate('listSong', null, Song.name)
      .exec(); // .exec() thực hiện truy vấn
  }
  async createPlaylist(
    createPlaylistDto: CreatePlaylistDto,
  ): Promise<PlayList> {
    const { userId } = createPlaylistDto;
    // Kiểm tra định dạng ObjectId cho userId
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Sai định dạng userId');
    }

    const newPlaylist = new this.playlistModel(createPlaylistDto);
    await newPlaylist.save();
    await this.userService.addPlaylistToUser(
      userId,
      newPlaylist._id.toString(),
    );
    return newPlaylist;
  }
  async findOne(id: string) {
    return this.playlistModel
      .findOne({ _id: id })
      .populate({
        path: 'listSong',
        model: 'Song',
        populate: {
          path: 'singerId',
          model: 'Singer',
        },
      })
      .exec();
  }
  async detail(id: string) {
    const userInfo: any = await this.userService.findUserId(id);
    const listPlaylist = userInfo.listPlaylist;
    return listPlaylist;
  }
  async addSong(idSongDto: SongToPlayList, playlistId: string, userId) {
    const userInfo: any = await this.userService.findUserId(userId);
    const listPlaylist = userInfo.listPlaylist;

    if (
      !listPlaylist.some(
        (playlist) => playlist._id.toString() === playlistId.toString(),
      )
    ) {
      throw new BadRequestException(
        'Playlist không tồn tại trong danh sách của người dùng.',
      );
    }

    const listFavoriteSong = userInfo.listFavoriteSong;
    if (!listFavoriteSong.includes(idSongDto.idSong)) {
      throw new BadRequestException(
        'Bài hát không có trong danh sách yêu thích.',
      );
    }
    const { idSong } = idSongDto;
    if (!isValidObjectId(playlistId)) {
      throw new BadRequestException('Sai định dạng playlistId');
    }

    if (!isValidObjectId(idSong)) {
      throw new BadRequestException('Sai định dạng idSong');
    }

    const existPlaylist = await this.playlistModel.findOne({
      _id: playlistId,
    });

    const existSong = await this.songService.findOneById(idSong);
    if (!existSong) {
      throw new BadRequestException('Song id khong hop le');
    }
    if (!existPlaylist) {
      throw new BadRequestException('PlayList Id khong hop le');
    }
    if (existPlaylist.listSong.includes(new Types.ObjectId(idSong))) {
      throw new BadRequestException('This song is existed');
    }
    const updatePlaylist = await this.playlistModel.updateOne(
      { _id: playlistId },
      { $push: { listSong: new Types.ObjectId(idSong) } },
    );

    if (!updatePlaylist) {
      throw new BadRequestException('Lỗi update playlist service');
    }

    return updatePlaylist;
  }
  async removeSong(idSongDto: SongToPlayList, playlistId: string, userId) {
    const userInfo: any = await this.userService.findUserId(userId);
    const listPlaylist = userInfo.listPlaylist;
    if (
      !listPlaylist.some(
        (playlist) => playlist._id.toString() === playlistId.toString(),
      )
    ) {
      throw new BadRequestException(
        'Playlist không tồn tại trong danh sách của người dùng.',
      );
    }

    const { idSong } = idSongDto;
    if (!isValidObjectId(playlistId)) {
      throw new BadRequestException('Sai định dạng playlistId');
    }

    if (!isValidObjectId(idSong)) {
      throw new BadRequestException('Sai định dạng idSong');
    }

    const existPlaylist = await this.playlistModel.findOne({
      _id: playlistId,
    });

    const existSong = await this.songService.findOneById(idSong);

    if (!existSong) {
      throw new BadRequestException('Song id khong hop le');
    }
    if (!existPlaylist) {
      throw new BadRequestException('PlayList Id khong hop le');
    }

    const updatePlaylist = await this.playlistModel.updateOne(
      { _id: playlistId },
      { $pull: { listSong: new Types.ObjectId(idSong) } },
    );
    const updatedPlaylist = await this.playlistModel
      .findById(playlistId)
      .populate('listSong');

    if (!updatePlaylist) {
      throw new BadRequestException('Lỗi update playlist service');
    }

    return updatePlaylist;
  }
  async remove(id: string, userId): Promise<PlayList> {
    const playlist = await this.playlistModel.findByIdAndDelete(id);
    this.userService.removePlaylistFromUser(userId, id);
    if (!playlist) {
      throw new NotFoundException(`Playlist với id ${id} không tồn tại`);
    }
    return playlist;
  }
  //swap song của playlist hoặc sửa title của playlist
  async edit(id: string, body: any) {
    if (body.listSong) {
      const playListOld = await this.playlistModel.findOne({ _id: id });

      // Kiểm tra nếu số lượng bài hát không giống nhau
      if (playListOld.listSong.length !== body.listSong.length) {
        throw new BadRequestException(
          'Bạn chỉ được sắp xếp các song trong playList',
        );
      }

      // Sử dụng Set để kiểm tra tính hợp lệ của các bài hát
      const playListOldSet = new Set(
        playListOld.listSong.map((song) => song.toString()),
      );

      // Kiểm tra xem tất cả các bài hát trong body.listSong có thuộc playListOld.listSong không
      for (const songId of body.listSong) {
        if (!playListOldSet.has(songId)) {
          throw new BadRequestException(
            `Bài hát với ID "${songId}" không tồn tại trong playlist cũ.`,
          );
        }
      }

      // Kiểm tra định dạng của từng ID trong listSong
      for (const songId of body.listSong) {
        if (!Types.ObjectId.isValid(songId)) {
          throw new BadRequestException(`ID "${songId}" không hợp lệ.`);
        }
      }

      // Chuyển đổi từng ID từ chuỗi sang ObjectId
      const updatedListSong = body.listSong.map(
        (songId: string) => new Types.ObjectId(songId),
      );

      // Cập nhật body với danh sách bài hát mới
      body.listSong = updatedListSong;
    }

    // Cập nhật playlist
    const playlist = await this.playlistModel.updateOne({ _id: id }, body);

    // Kiểm tra xem playlist có tồn tại không
    if (playlist.modifiedCount === 0) {
      throw new NotFoundException(
        `Playlist với id ${id} không tồn tại hoặc không có thay đổi nào.`,
      );
    }

    // Tìm và trả về playlist đã cập nhật
    const updatedPlaylist = await this.playlistModel
      .findById(id)
      .populate('listSong');
    return updatedPlaylist;
  }
  //xoa tat ca playlist cua user khi user bi xoa
  async removeByDeleteUser(userId: string) {
    return await this.playlistModel.deleteMany({ userId: userId });
  }
}
