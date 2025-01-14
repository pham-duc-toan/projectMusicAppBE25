import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Role, RoleDocument } from './roles.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from 'src/permissions/permissions.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly permissionService: PermissionsService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  existPermission = async (id: string) => {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id role');
    }
    const result = await this.permissionService.existPermission(id);
    return result;
  };
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleModel
      .findOne({ roleName: createRoleDto.roleName })
      .exec();
    if (existingRole) {
      throw new ConflictException(
        `Role with name ${createRoleDto.roleName} already exists`,
      );
    }
    // Kiểm tra nếu mảng permissions hợp lệ
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      for (const permissionId of createRoleDto.permissions) {
        // Kiểm tra xem permissionId có hợp lệ không
        const isValidPermission = await this.existPermission(
          permissionId.toString(),
        );
        if (!isValidPermission) {
          throw new BadRequestException(
            `Permission ${permissionId} is not valid`,
          );
        }
      }
    }
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll(options: any) {
    const { filter, sort, skip, limit, projection, population } = options;

    return this.roleModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
  }
  async findFull(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }
  async findOne(id: string): Promise<Role> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id role');
    }
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')

      .exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }
  async findRoleClient() {
    return this.roleModel.findOne({ roleName: 'User' });
  }
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id role');
    }
    if (updateRoleDto.roleName) {
      const existingRole = await this.roleModel
        .findOne({ roleName: updateRoleDto.roleName, _id: { $ne: id } })
        .exec();
      if (existingRole) {
        throw new ConflictException(
          `Role with name ${updateRoleDto.roleName} already exists`,
        );
      }
    }
    // Kiểm tra nếu mảng permissions hợp lệ
    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      for (const permissionId of updateRoleDto.permissions) {
        // Kiểm tra xem permissionId có hợp lệ không
        const isValidPermission = await this.existPermission(
          permissionId.toString(),
        );
        if (!isValidPermission) {
          throw new BadRequestException(
            `Permission ${permissionId} is not valid`,
          );
        }
      }
    }
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .populate('permissions')
      .exec();

    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return updatedRole;
  }

  async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id role');
    }
    const roleCurrent = await this.roleModel.findById(id);
    if (roleCurrent.roleName == 'User' || roleCurrent.roleName == 'Admin') {
      throw new BadRequestException('Không thể xóa role Admin hoặc User!');
    }
    const roleClient = await this.roleModel.findOne({ roleName: 'User' });
    await this.userService.removeRole(id, roleClient.id);
    const result = await this.roleModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }
}
