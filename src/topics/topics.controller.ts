import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  Patch,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './topics.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { isValidObjectId } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ValidatorFileExistImage,
  ValidatorFileTypeImage,
} from 'src/interceptors/ValidatorFileExist.interceptor';
import { CloudinaryFileUploadInterceptor } from 'src/interceptors/FileToLinkOnlineCloudinary.interceptor';
import aqp from 'api-query-params';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('avatar'),
    ValidatorFileExistImage,
    CloudinaryFileUploadInterceptor,
  )
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<Topic[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;

    return this.topicsService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }

  @Get('client')
  async findClient(@Query() query: any): Promise<Topic[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;

    return this.topicsService.findClient({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @Get('detail/:slug')
  async findOne(@Param('slug') slug: string): Promise<Topic> {
    return this.topicsService.findOne(slug);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('editTopic/:id')
  @UseInterceptors(
    FileInterceptor('avatar'),
    ValidatorFileTypeImage,
    CloudinaryFileUploadInterceptor,
  )
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<Topic> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.topicsService.update(id, updateTopicDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.topicsService.remove(id);
  }
}
