import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import aqp from 'api-query-params';
import { UpdateSinger } from './dto/update-singer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatorFileTypeImage } from 'src/interceptors/ValidatorFileExist.interceptor';
import { CloudinaryFileUploadInterceptor } from 'src/interceptors/FileToLinkOnlineCloudinary.interceptor';
import { changePassword } from './dto/change-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    const { sort, skip, limit, projection, population, ...e } = aqp(query);
    const filter = e.filter;
    return this.userService.findAll({
      filter,
      sort,
      skip,
      limit,
      projection,
      population,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<User> {
    return this.userService.profileUser(req.user._id);
  }
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar'),
    ValidatorFileTypeImage,
    CloudinaryFileUploadInterceptor,
  )
  @Patch('detail')
  async updateProfile(@Request() req, @Body() updateUser: UpdateUserDto) {
    return this.userService.updateProfile(req.user._id, updateUser);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('updateSinger')
  async updateSinger(@Request() req, @Body() singerId: UpdateSinger) {
    return this.userService.updateSinger(req.user._id, singerId.id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('change-status/:id')
  async changeStatus(@Param('id') id: string): Promise<User> {
    return this.userService.updateStatus(id);
  }
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.userService.deleteOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('change-role/:idUser/:idRole')
  async updateRole(
    @Param('idUser') idUser: string, // Lấy tham số idUser từ route
    @Param('idRole') idRole: string, // Lấy tham số idRole từ route
  ): Promise<User> {
    return this.userService.updateRole(idUser, idRole);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() body: changePassword) {
    return this.userService.changePassword(req.user.username, body);
  }
  @Get('test')
  async test() {
    this.userService.test();
    return 'ok';
  }
}
