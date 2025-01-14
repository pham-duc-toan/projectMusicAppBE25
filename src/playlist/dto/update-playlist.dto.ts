import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePlaylistDto } from './create-playlist.dto';

export class UpdatePlaylistDto extends OmitType(
  PartialType(CreatePlaylistDto),
  ['userId'] as const,
) {}
