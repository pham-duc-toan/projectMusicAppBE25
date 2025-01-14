import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Thiếu roleName' })
  @IsString()
  readonly roleName: string;

  @IsArray()
  @IsOptional()
  readonly permissions?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  readonly deleted?: boolean;

  @IsOptional()
  readonly deletedAt?: Date | null;
}
