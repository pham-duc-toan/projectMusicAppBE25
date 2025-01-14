import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Types } from 'mongoose';
import { SongForYou } from './songForYou.shema';

@Injectable()
export class SongForYouService {
  constructor(
    @InjectModel(SongForYou.name) private songForYouModel: Model<SongForYou>,
  ) {}

  // Lấy danh sách bài hát đề xuất
  async getRecommendedSongs(): Promise<SongForYou> {
    return this.songForYouModel
      .findOne({})
      .populate({
        path: 'listSong',
        model: 'Song',
        populate: [
          {
            path: 'singerId',
            model: 'Singer',
          },
          {
            path: 'topicId',
            model: 'Topic',
          },
        ],
      })
      .exec();
  }
  async getClientRecommendSong(options: any): Promise<SongForYou> {
    const { filter, sort, skip, limit, projection, population } = options;

    const songForYou = await this.songForYouModel
      .findOne({})
      .populate({
        path: 'listSong',
        model: 'Song',
        populate: [
          {
            path: 'singerId',
            model: 'Singer',
          },
          {
            path: 'topicId',
            model: 'Topic',
          },
        ],
      })
      .exec();

    if (songForYou?.listSong) {
      // Lọc các bài hát có status là 'active'
      songForYou.listSong = songForYou.listSong
        .filter(
          (song: any) => song.status === 'active' && song.deleted === false,
        )
        .slice(0, limit);
    }

    return songForYou;
  }

  async getSongs(): Promise<SongForYou> {
    return this.songForYouModel
      .findOne({})

      .exec();
  }
  // Thêm bài hát vào danh sách đề xuất
  async addSongToList(songId: Types.ObjectId): Promise<SongForYou> {
    const songForYou = await this.songForYouModel.findOneAndUpdate(
      {},
      { $push: { listSong: songId } },
      { new: true, upsert: true },
    );
    return songForYou;
  }

  // Xóa bài hát khỏi danh sách
  async removeSongFromList(songId: Types.ObjectId): Promise<SongForYou> {
    return this.songForYouModel.findOneAndUpdate(
      {},
      { $pull: { listSong: songId } },
      { new: true },
    );
  }
  async updateSongs(listSong: string[]) {
    // Chuyển đổi các chuỗi trong listSong thành Types.ObjectId
    const objectIdList = listSong.map((songId) => new Types.ObjectId(songId));

    // Thực hiện cập nhật với listSong đã chuyển đổi
    return this.songForYouModel.updateOne({}, { listSong: objectIdList });
  }
}
