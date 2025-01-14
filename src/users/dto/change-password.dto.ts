import { IsNotEmpty, IsString } from 'class-validator';

export class changePassword {
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  passNew: string;
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @IsString()
  passOld: string;
}
