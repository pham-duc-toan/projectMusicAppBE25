// src/singers/dto/create-singer.dto.ts

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSingerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsString()
  status: string;
}

// src/singers/dto/update-singer.dto.ts
