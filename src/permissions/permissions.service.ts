import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Permission, PermissionDocument } from './permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}
  existPermission = async (id: string): Promise<Boolean> => {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      return false;
    }
    return true;
  };
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionModel
      .findOne({
        pathName: createPermissionDto.pathName,
        method: createPermissionDto.method,
      })
      .exec();
    if (existingPermission) {
      throw new ConflictException(
        `Permission with path ${createPermissionDto.pathName} and method ${createPermissionDto.method} already exists`,
      );
    }
    const createdPermission = new this.permissionModel(createPermissionDto);
    return createdPermission.save();
  }

  async findAll(options: any) {
    const { filter, sort, skip, limit, projection, population } = options;

    return this.permissionModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
  }

  async findOne(id: string): Promise<Permission> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const { pathName, method } = updatePermissionDto;
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    // Kiểm tra xem permission với pathName và method đã tồn tại chưa
    const existingPermission = await this.permissionModel
      .findOne({
        pathName,
        method,
        _id: { $ne: id }, // Loại trừ permission hiện tại
      })
      .exec();

    if (existingPermission) {
      throw new ConflictException(
        `Permission with path ${pathName} and method ${method} already exists`,
      );
    }
    const updatedPermission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();

    if (!updatedPermission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return updatedPermission;
  }

  async remove(): Promise<void> {
    const result = await this.permissionModel.deleteMany({}).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Chưa xóa được`);
    }
  }
  async removeOne(id: string): Promise<void> {
    const result = await this.permissionModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Chưa xóa được`);
    }
  }
}
