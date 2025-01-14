import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email khong dung dinh dang' })
  @IsNotEmpty({ message: 'email khong duoc de trong' })
  username: string;
  @IsNotEmpty({ message: 'password khong duoc de trong' })
  password: string;
  @IsNotEmpty({ message: 'userId khong duoc de trong' })
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'userId chỉ được chứa chữ, số và dấu _',
  })
  userId: string;
  @IsNotEmpty({ message: 'Ten khong duoc de trong' })
  fullName: string;
  @IsNotEmpty({ message: 'Type không được để trống' })
  @IsIn(['SYSTEM'], {
    message: 'Không đúng định dạng type',
  })
  type: string;
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
  @IsOptional()
  avatar?: string; // Trường avatar không bắt buộc
}
