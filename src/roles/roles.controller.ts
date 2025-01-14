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

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './roles.schema';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponeMessage } from 'src/decorator/customize';
import { isValidObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: any): Promise<Role[]> {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);

    const filter = e.filter;
    return this.rolesService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @Get('full')
  async findFull(): Promise<Role[]> {
    return this.rolesService.findFull();
  }
  @Get('detail/:id')
  async findOne(@Param('id') id: string): Promise<Role> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.rolesService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.update(id, updateRoleDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return this.rolesService.remove(id);
  }
}
