import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Topic, TopicDocument } from './topics.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { convertToSlug } from 'src/helpers/convertToSlug';
import { SongsService } from 'src/songs/songs.service';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @Inject(forwardRef(() => SongsService))
    private readonly songService: SongsService,
  ) {}
  async existId(id: string) {
    if (!isValidObjectId(id)) {
      return false; // Hoặc bạn có thể ném ra một lỗi tùy vào yêu cầu
    }
    const exist = await this.topicModel.findOne({ _id: id });
    if (exist) {
      return true;
    }
    return false;
  }

  async create(createTopicDto: CreateTopicDto) {
    const createdTopic = new this.topicModel(createTopicDto);

    return createdTopic.save();
  }

  async findAll(options: any): Promise<Topic[]> {
    const { filter, sort, skip, limit, projection, population } = options;
    if (filter.title && typeof filter.title !== 'string') {
      filter.title = '';
    }
    if (filter.slug && typeof filter.slug !== 'string') {
      filter.slug = '';
    }

    return this.topicModel
      .find({
        $or: [
          { title: new RegExp(filter.title, 'i') },
          { slug: new RegExp(convertToSlug(filter.slug), 'i') },
          { filter },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
  }
  async findClient(options: any): Promise<Topic[]> {
    const { filter, sort, skip, limit, projection, population } = options;
    if (filter.title && typeof filter.title !== 'string') {
      filter.title = '';
    }
    if (filter.slug && typeof filter.slug !== 'string') {
      filter.slug = '';
    }

    const topics = await this.topicModel
      .find({ status: 'active', deleted: false })
      .find({
        $or: [
          { title: new RegExp(filter.title, 'i') },
          { slug: new RegExp(convertToSlug(filter.slug), 'i') },
          { filter },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();

    // Thêm trường số lượng bài hát (songs) cho mỗi topic
    const enrichedTopics = await Promise.all(
      topics.map(async (topic: any) => {
        const songsCount = await this.songService.findOfTopic(topic._id);
        const count = songsCount.length || 0;
        return {
          ...topic.toObject(), // Chuyển từ mongoose object sang plain object
          songsCount: count, // Thêm trường số lượng bài hát
        };
      }),
    );

    return enrichedTopics;
  }
  async findOne(slug: string): Promise<Topic> {
    const topic = await this.topicModel.findOne({ slug }).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with slug ${slug} not found`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    const updatedTopic = await this.topicModel
      .findByIdAndUpdate(id, updateTopicDto, { new: true })
      .exec();
    if (!updatedTopic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    if (updateTopicDto.status == 'inactive') {
      await this.songService.banSongByBanTopic(id);
    }
    return updatedTopic;
  }

  async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    const result = await this.topicModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }
}
