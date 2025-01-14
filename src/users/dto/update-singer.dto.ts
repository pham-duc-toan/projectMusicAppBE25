import { IsNotEmpty } from 'class-validator';

export class UpdateSinger {
  @IsNotEmpty({ message: 'SingerId khong duoc de trong' })
  id: string;
}
