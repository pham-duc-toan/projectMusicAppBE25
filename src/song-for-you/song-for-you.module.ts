import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongForYou, SongForYouSchema } from './songForYou.shema';
import { SongForYouController } from './song-for-you.controller';
import { SongForYouService } from './song-for-you.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SongForYou.name, schema: SongForYouSchema },
    ]),
  ],
  controllers: [SongForYouController],
  providers: [SongForYouService],
  exports: [SongForYouService],
})
export class SongForYouModule {}
