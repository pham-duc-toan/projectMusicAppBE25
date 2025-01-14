import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipeBuilder,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';

import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { isValidObjectId } from 'mongoose';
import { CloudinaryMultiFileUploadInterceptor } from 'src/interceptors/FileToLinkOnlineCloudinary.interceptor';
import {
  ValidatorFileExistImageAndAudio,
  ValidatorFileTypeImageAndAudio,
} from 'src/interceptors/ValidatorFileExist.interceptor';
import aqp from 'api-query-params';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

import { SingersService } from 'src/singers/singers.service';

@Controller('songs')
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly singersService: SingersService,
  ) {}
  //CHECK ROLE
  async checkSinger(req: any) {
    const singerId = req.user.singerId;
    const singer = await this.singersService.findOne(singerId);
    if (singer.status === 'inactive') {
      throw new UnauthorizedException(
        'Tài khoản ca sĩ của bạn đang ở trạng thái không hoạt động (inactive).',
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
    ValidatorFileExistImageAndAudio,
    CloudinaryMultiFileUploadInterceptor,
  )
  async create(@Body() createSongDto: CreateSongDto, @Request() req) {
    await this.checkSinger(req);
    //logic
    createSongDto.audio = createSongDto.audio[0];
    createSongDto.avatar = createSongDto.avatar[0];

    return this.songsService.create(createSongDto, req.user?.singerId || '');
  }

  @Patch('editSong/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
    ValidatorFileTypeImageAndAudio,
    CloudinaryMultiFileUploadInterceptor,
  )
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    @Body()
    updateSongDto: UpdateSongDto,
    @Request() req,
  ) {
    await this.checkSinger(req);

    if (updateSongDto.audio) {
      updateSongDto.audio = updateSongDto.audio[0];
    }
    if (updateSongDto.avatar) {
      updateSongDto.avatar = updateSongDto.avatar[0];
    }
    return this.songsService.update(
      id,
      updateSongDto,
      req.user?.singerId || '',
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('full')
  findFull(@Query() query: any) {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.songsService.findFull({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @Get()
  findAll(@Query() query: any) {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.songsService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @Get('song-of-singer/:singerId')
  findSongOfSinger(@Param('singerId') singerId: string) {
    return this.songsService.findOfSinger(singerId);
  }
  @Get('song-of-topic/:topicId')
  findSongOfTopic(@Param('topicId') topicId: string) {
    return this.songsService.findOfTopic(topicId);
  }
  @Get('detail/:slug')
  findOne(@Param('slug') slug: string) {
    return this.songsService.findOne(slug);
  }
  @UseGuards(JwtAuthGuard)
  @Get('managerSong')
  manager(@Request() req) {
    if (!req.user.singerId) {
      throw new UnauthorizedException('Bạn không phải là ca sĩ!');
    }
    return this.songsService.findSongBySinger(req.user.singerId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('deleteSong/:id')
  remove(@Param('id') id: string, @Request() req) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.songsService.remove(id, req.user.singerId);
  }
  //----FAVORITE SONG-----
  @UseGuards(JwtAuthGuard)
  @Get('favoriteSongs')
  favoriteSongs(@Request() req) {
    return this.songsService.getFavoriteSongs(req.user._id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('favoriteSongs/add/:id')
  async addFavoriteSongs(@Request() req, @Param('id') id: string) {
    return this.songsService.addSongFavorite(req.user._id, id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('favoriteSongs/remove/:id')
  async removeFavoriteSongs(@Request() req, @Param('id') id: string) {
    return this.songsService.removeSongFavorite(req.user._id, id);
  }
  //-------SO LUOT NGHE-----------
  @Patch('listen/increase/:id')
  async increaseListen(@Param('id') id: string) {
    return await this.songsService.increaseListen(id);
  }
  //--------ADMIN QUAN LY-----
  @UseGuards(JwtAuthGuard)
  @Patch('changeStatus/:id')
  async changeStatus(@Param('id') id: string) {
    return await this.songsService.changeStatus(id);
  }
  //------TEST-----------------
  @Patch('test')
  async test() {
    console.log('check');

    return await this.songsService.test();
  }
}
