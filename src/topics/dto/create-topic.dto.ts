import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  description?: string = '';

  @IsString()
  status: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean = false;
}
