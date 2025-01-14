import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Thiếu name' })
  @IsString()
  name: string;
  @IsNotEmpty({ message: 'Thiếu pathName' })
  @IsString()
  pathName: string;
  @IsNotEmpty({ message: 'Thiếu method' })
  @IsString()
  method: string;
}
