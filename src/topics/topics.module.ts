import { forwardRef, Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './topics.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { SongsModule } from 'src/songs/songs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    CloudinaryModule,
    forwardRef(() => SongsModule),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
