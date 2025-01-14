// src/singers/singers.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  Patch,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { SingersService } from './singers.service';
import { Singer } from './singers.schema';
import { ResponeMessage, User } from 'src/decorator/customize';
import { isValidObjectId } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryFileUploadInterceptor } from 'src/interceptors/FileToLinkOnlineCloudinary.interceptor';
import { UpdateSingerDto } from './dto/update-singer.dto';
import {
  ValidatorFileExistImage,
  ValidatorFileTypeImage,
} from 'src/interceptors/ValidatorFileExist.interceptor';
import { CreateSingerDto } from './dto/create-singer.dto';
import aqp from 'api-query-params';

import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

@Controller('singers')
export class SingersController {
  constructor(private readonly singersService: SingersService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('avatar'),
    ValidatorFileExistImage,
    CloudinaryFileUploadInterceptor,
  )
  async createSinger(@Body() createSingerDto: CreateSingerDto, @Request() req) {
    if (req.user.singerId) {
      throw new UnauthorizedException('Bạn đã quản lý ca sĩ rồi!');
    }
    return this.singersService.createSinger(createSingerDto, req.user._id);
  }
  @Get()
  @ResponeMessage('Find all')
  async findAll(@Query() query: any): Promise<Singer[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.singersService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @Get('client')
  @ResponeMessage('Find all client')
  async findClient(@Query() query: any): Promise<Singer[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.singersService.findClient({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('avatar'),
    ValidatorFileTypeImage,
    CloudinaryFileUploadInterceptor,
  )
  async patchSinger(
    @Param('id') id: string,
    @Request() req,
    @Body() updateSingerDto: UpdateSingerDto,
  ) {
    if (req.user.singerId != id) {
      throw new UnauthorizedException('Bạn không phải quản lý ca sĩ này!');
    }
    return this.singersService.patchSinger(id, updateSingerDto);
  }
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.singersService.findOne(id);
  }
  @Get('detailClient/:slug')
  async findOneClient(@Param('slug') slug: string) {
    return this.singersService.findOneClient(slug);
  }
  //--------ADMIN QUAN LY-----
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSinger(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.singersService.deleteSinger(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('changeStatus/:id')
  async changeStatus(@Param('id') id: string) {
    return await this.singersService.changeStatus(id);
  }
}
