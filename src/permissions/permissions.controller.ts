import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './permission.schema';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponeMessage } from 'src/decorator/customize';
import { isValidObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
const API = '/api/v1/';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    createPermissionDto.pathName = API + createPermissionDto.pathName;
    return this.permissionsService.create(createPermissionDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: any): Promise<Permission[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.permissionsService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  async findOne(@Param('id') id: string): Promise<Permission> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.permissionsService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    updatePermissionDto.pathName = API + updatePermissionDto.pathName;
    return this.permissionsService.update(id, updatePermissionDto);
  }
  @UseGuards(JwtAuthGuard)
  @ResponeMessage('Xóa tất cả')
  @Delete('')
  async remove(): Promise<void> {
    return this.permissionsService.remove();
  }
  @ResponeMessage('Xóa tất cả')
  @Delete(':id')
  async removeOne(@Param('id') id: string): Promise<void> {
    return this.permissionsService.removeOne(id);
  }
}
