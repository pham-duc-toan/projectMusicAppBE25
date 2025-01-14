// src/singers/singers.service.ts

import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Singer, SingerDocument } from './singers.schema';
import { UpdateSingerDto } from './dto/update-singer.dto';
import { convertToSlug } from 'src/helpers/convertToSlug';
import { UserService } from 'src/users/users.service';
import { SongsService } from 'src/songs/songs.service';
import { CreateSingerDto } from './dto/create-singer.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class SingersService {
  constructor(
    @InjectModel(Singer.name) private singerModel: Model<SingerDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => SongsService))
    private readonly songService: SongsService,
    private readonly orderService: OrderService,
  ) {}
  async existId(id: string) {
    if (!isValidObjectId(id)) {
      return false; // Hoặc bạn có thể ném ra một lỗi tùy vào yêu cầu
    }
    const exist = await this.singerModel.findOne({ _id: id });
    if (exist) {
      return true;
    }
    return false;
  }

  async createSinger(data: CreateSingerDto, userId: any) {
    const order = await this.orderService.findOrder({
      userId,
      status: 'init',
      resultCode: '0',
    });

    if (!order) {
      throw new UnauthorizedException(
        'Không thể tạo vì chuyển khoản không hợp lệ!',
      );
    }

    await this.orderService.updateStatus(order.orderId, 'done');
    const newSinger = new this.singerModel(data);
    await newSinger.save();
    return this.userService.updateSinger(userId, newSinger._id.toString());
  }
  async patchSinger(id: string, updateSingerDto: UpdateSingerDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }

    const updateSinger = await this.singerModel.updateOne(
      { _id: id },
      updateSingerDto,
    );
    if (!updateSinger) {
      throw new BadRequestException('Lỗi update singer service');
    }
    return updateSinger;
  }

  async findAll(options: any) {
    const { filter, sort, skip, limit, projection, population } = options;

    if (filter.fullName && typeof filter.fullName !== 'string') {
      filter.fullName = '';
    }
    if (filter.slug && typeof filter.slug !== 'string') {
      filter.slug = '';
    }
    return this.singerModel
      .find({
        $or: [
          { fullName: new RegExp(filter.query, 'i') },
          { slug: new RegExp(convertToSlug(filter.query), 'i') },
          { filter },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
  }
  async findClient(options: any) {
    const { filter, sort, skip, limit, projection, population } = options;

    if (filter.fullName && typeof filter.fullName !== 'string') {
      filter.fullName = '';
    }
    if (filter.slug && typeof filter.slug !== 'string') {
      filter.slug = '';
    }
    const singers = await this.singerModel
      .find({ status: 'active', deleted: false })
      .find({
        $or: [
          { fullName: new RegExp(filter.query, 'i') },
          { slug: new RegExp(convertToSlug(filter.query), 'i') },
          { filter },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
    // Thêm trường số lượng bài hát (songs) cho mỗi singer
    const enrichedSingers = await Promise.all(
      singers.map(async (singer: any) => {
        const songsCount = await this.songService.findOfSinger(singer._id);
        const count = songsCount.length || 0;
        return {
          ...singer.toObject(), // Chuyển từ mongoose object sang plain object
          songsCount: count, // Thêm trường số lượng bài hát
        };
      }),
    );

    return enrichedSingers;
  }
  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    const singer = await this.singerModel.findById(id).exec();
    return singer;
  }
  async findOneClient(slug: string) {
    const singer = await this.singerModel
      .findOne({ slug, status: 'active', deleted: false })
      .exec();
    if (!singer) {
      throw new BadRequestException('Không tồn tại singer này!');
    }
    return singer;
  }
  //-------ADMIN QUAN LY-------
  async deleteSinger(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }

    const singer = await this.singerModel.deleteOne({ _id: id });
    await this.userService.deleteSinger(id);

    return singer;
  }

  async changeStatus(singerId: string) {
    const singer = await this.singerModel.findById(singerId);
    if (!singer) {
      throw new NotFoundException('Ca sĩ không tồn tại');
    }
    if (singer.status == 'active') {
      singer.status = 'inactive';
      await this.songService.banSongByBanSinger(singerId);
    } else {
      singer.status = 'active';
    }

    await singer.save();

    return singer;
  }
}
