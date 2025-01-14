import { PartialType } from '@nestjs/mapped-types';
import { CreateSongForYouDto } from './create-song-for-you.dto';

export class UpdateSongForYouDto extends PartialType(CreateSongForYouDto) {}
