import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsIn,
  IsArray,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsStringOrArray } from 'src/common/validators/validatorsDecorate';

export class CreateSongDto {
  @IsString()
  @IsNotEmpty({ message: 'Thiếu title' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Thiếu topic' })
  @IsString()
  topicId: string;

  @IsOptional()
  @Validate(IsStringOrArray)
  avatar?: string | string[];

  @IsOptional()
  @Validate(IsStringOrArray)
  audio?: string | string[];

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsNotEmpty({ message: 'Thiếu status' })
  @IsIn(['active', 'inactive'], {
    message: 'Không đúng định dạng status',
  })
  status: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
