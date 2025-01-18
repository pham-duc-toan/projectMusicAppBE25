import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, ObjectId, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { RolesService } from 'src/roles/roles.service';
import { SingersService } from 'src/singers/singers.service';
import { PlaylistService } from 'src/playlist/playlist.service';
import { changePassword } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => RolesService))
    private readonly roleService: RolesService,
    @Inject(forwardRef(() => SingersService))
    private readonly singerService: SingersService,
    @Inject(forwardRef(() => PlaylistService))
    private readonly playlistService: PlaylistService,
  ) {}

  getHashPassWord = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = this.getHashPassWord(createUserDto.password);
    const existUserId = await this.userModel.findOne({
      userId: createUserDto.userId,
    });
    const existUser = await this.userModel.findOne({
      username: createUserDto.username,
      type: createUserDto.type,
    });
    const roleClient: any = await this.roleService.findRoleClient();

    const fullCreateUserDto = {
      ...createUserDto,
      role: roleClient._id, // Thêm trường role mà không sửa DTO
    };
    if (!existUser && !existUserId) {
      const createdUser = new this.userModel(fullCreateUserDto);
      return createdUser.save();
    }
    throw new BadRequestException(`Đã tồn tại tài khoản!`);
  }

  async findAll(options: any) {
    const { filter, sort, skip, limit, projection, population } = options;
    const total = await this.userModel.countDocuments(filter);
    const data = await this.userModel
      .find(filter)
      .sort(sort)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .populate(population)
      .exec();
    return { data, total };
  }
  async addPlaylistToUser(userId: string, playlistId: string): Promise<User> {
    // Tìm user theo userId
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Thêm playlistId vào listPlaylist
    user.listPlaylist.push(new Types.ObjectId(playlistId));
    await user.save(); // Lưu user với listPlaylist đã được cập nhật

    return user;
  }
  async findUserId(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('-password')
      .populate({
        path: 'listPlaylist',
        model: 'PlayList',
        populate: {
          path: 'listSong',
          model: 'Song',
          populate: {
            path: 'singerId',
            model: 'Singer',
          },
        },
      })
      .exec();

    return user;
  }
  async profileUser(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('-password')
      .populate({
        path: 'role',
        model: 'Role',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      })

      .populate({
        path: 'listPlaylist',
        model: 'PlayList',
        populate: {
          path: 'listSong',
          model: 'Song',
          populate: [
            {
              path: 'singerId',
              model: 'Singer',
            },
            {
              path: 'topicId',
              model: 'Topic',
            },
          ],
        },
      })
      .populate({
        path: 'listFavoriteSong',
        model: 'Song',
        populate: [
          {
            path: 'singerId',
            model: 'Singer',
          },
          {
            path: 'topicId',
            model: 'Topic',
          },
        ],
      })
      .populate({
        path: 'singerId',
        model: 'Singer',
      })
      .exec();

    return user;
  }
  async checkUserLogin(username: string, pass: string) {
    const user = await this.userModel
      .findOne({ username: username, type: 'SYSTEM' })
      .populate('role')
      .lean()
      .exec();
    if (!user) {
      throw new BadRequestException('Sai tài khoản hoặc mật khẩu');
    }
    if (user.status == 'inactive') {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa');
    }
    if (user.deleted == true) {
      throw new BadRequestException('Tài khoản của bạn đã bị xóa');
    }
    if (user && compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    throw new BadRequestException('Sai tài khoản hoặc mật khẩu');
  }
  async deleteOne(id: string) {
    const user = await this.userModel.findById(id);
    if (user?.singerId) {
      const singerId = user.singerId.toString();
      await this.singerService.deleteSinger(singerId);
    }
    await this.playlistService.removeByDeleteUser(id);
    return await this.userModel.findByIdAndDelete(id).exec();
  }
  updateTokenRefresh = async (refresh_token: string, id: string) => {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Sai định dạng id');
    }
    return await this.userModel.updateOne(
      { _id: id },
      {
        refreshToken: refresh_token,
      },
    );
  };
  findByTokenRefresh = async (refresh_token: string) => {
    return await this.userModel
      .findOne({
        refreshToken: refresh_token,
      })
      .populate('role');
  };
  //xóa playlist
  async removePlaylistFromUser(userId: Types.ObjectId, playlistId: string) {
    // Chuyển đổi playlistId từ string sang ObjectId
    const playlistObjectId = new Types.ObjectId(playlistId);

    // Tìm user và cập nhật bằng cách xóa playlistId khỏi listPlaylist
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { listPlaylist: playlistObjectId } },
        { new: true },
      )
      .select('-password');

    // Nếu user không tồn tại, ném lỗi
    if (!updatedUser) {
      throw new NotFoundException('User không tồn tại');
    }

    return { message: 'Xóa playlist thành công', user: updatedUser };
  }
  async updateSinger(userId: Types.ObjectId, singerId: string) {
    // Chuyển đổi singerId từ string sang ObjectId
    const singerObjectId = new Types.ObjectId(singerId);

    // Kiểm tra người dùng có tồn tại không
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra xem user đã có trường singerId chưa
    if (user.singerId) {
      throw new BadRequestException('User đã được đăng ký singer');
    }

    // Kiểm tra xem singerId đã được quản lý bởi user khác chưa
    const singerManaged = await this.userModel
      .findOne({
        singerId: singerObjectId,
      })
      .select('-password');
    if (singerManaged) {
      throw new BadRequestException('Singer đã được quản lý');
    }

    // Nếu các điều kiện thỏa mãn, cập nhật singerId cho user
    user.singerId = singerObjectId;
    await user.save();

    return { message: 'Cập nhật singerId thành công', user };
  }
  async updateProfile(userId: Types.ObjectId, updateUser: UpdateUserDto) {
    try {
      // Kiểm tra và cập nhật người dùng
      const user = await this.userModel
        .findOneAndUpdate(
          { _id: userId }, // Điều kiện tìm kiếm
          updateUser, // Dữ liệu cần cập nhật
          { new: true }, // Trả về bản ghi sau khi cập nhật
        )
        .select('-password');

      if (!user) {
        throw new Error('Người dùng không tồn tại.');
      }

      return user;
    } catch (error) {
      throw new Error(`Cập nhật thất bại: ${error.message}`);
    }
  }
  // xoa singerId khi singerId xoa
  async deleteSinger(singerId: string) {
    return await this.userModel.findOneAndUpdate(
      { singerId: new Types.ObjectId(singerId) }, // Chuyển `singerId` thành ObjectId
      { singerId: null }, // Đặt lại giá trị null (hoặc undefined nếu muốn)
      { new: true }, // Trả về bản ghi đã cập nhật
    );
  }
  //----FAVORITE SONGS--------
  async getFavoriteSongs(userId: Types.ObjectId) {
    // Tìm user theo userId và populate listFavoriteSong để lấy chi tiết các bài hát
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate({
        path: 'listFavoriteSong',
        model: 'Song', // Model 'Song' cần khớp với tên model của bài hát
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return user.listFavoriteSong; // Trả về danh sách yêu thích
  }

  async addSongFavorite(userId: Types.ObjectId, songId: string): Promise<User> {
    // Tìm user theo userId
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra xem songId đã tồn tại trong listFavoriteSong chưa
    const songObjectId = new Types.ObjectId(songId);
    if (user.listFavoriteSong.includes(songObjectId)) {
      throw new BadRequestException('Bài hát đã có trong danh sách yêu thích');
    }

    // Thêm songId vào listFavoriteSong
    user.listFavoriteSong.push(songObjectId);
    await user.save(); // Lưu user với listFavoriteSong đã được cập nhật

    return user;
  }
  async removeSongFavorite(
    userId: Types.ObjectId,
    songId: string,
  ): Promise<User> {
    // Tìm user theo userId
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Chuyển đổi songId từ string sang ObjectId
    const songObjectId = new Types.ObjectId(songId);

    // Kiểm tra xem songId có tồn tại trong listFavoriteSong không
    const songIndex = user.listFavoriteSong.indexOf(songObjectId);
    if (songIndex === -1) {
      throw new BadRequestException(
        'Bài hát không có trong danh sách yêu thích',
      );
    }

    // Xóa songId khỏi listFavoriteSong
    user.listFavoriteSong.splice(songIndex, 1);
    await user.save(); // Lưu user với listFavoriteSong đã được cập nhật

    return user;
  }
  async updateStatus(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }
    let newStatus = 'active';
    if (user.status == 'active') {
      newStatus = 'inactive';
    }
    //@ts-ignore
    user.status = newStatus;
    await user.save();
    return user;
  }
  async updateRole(userId: string, roleId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel
      .findByIdAndUpdate(userId, { role: new Types.ObjectId(roleId) })
      .select('-password');
  }
  //user thay doi khi xoa role
  async removeRole(roleId: string, roleNew: string) {
    return await this.userModel
      .updateMany(
        { role: new Types.ObjectId(roleId) },
        { role: new Types.ObjectId(roleNew) },
      )
      .select('-password');
  }
  async test(): Promise<void> {
    try {
      // Update all users' status to 'active'
      const result = await this.userModel.updateMany(
        {}, // This is the filter, empty means all users
        { $set: { status: 'active' } }, // The update operation to set status to 'active'
      );
    } catch (error) {
      console.error('Error updating users:', error);
    }
  }
  //user đổi mật khẩu
  async changePassword(username: string, dataPass: changePassword) {
    const { passOld, passNew } = dataPass;

    // Tìm user dựa trên username
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại!');
    }

    // Kiểm tra mật khẩu cũ có khớp không
    const isMatch = compareSync(passOld, user.password); // So sánh mật khẩu cũ
    if (!isMatch) {
      throw new BadRequestException('Sai mật khẩu cũ!');
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = this.getHashPassWord(passNew);

    // Cập nhật mật khẩu mới cho user
    user.password = hashedPassword;
    await user.save(); // Lưu thay đổi vào cơ sở dữ liệu

    return { message: 'Đổi mật khẩu thành công!' };
  }
  //user cap nhat mat khau moi
  async changePasswordByOTP(username: string, passNew: string) {
    // Tìm user dựa trên username
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại!');
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = this.getHashPassWord(passNew);

    // Cập nhật mật khẩu mới cho user
    user.password = hashedPassword;
    await user.save(); // Lưu thay đổi vào cơ sở dữ liệu

    return { message: 'Đổi mật khẩu thành công!' };
  }
  //GOOGLE OAUTH
  //tim user bang email type google
  async findOneByEmailGoogle(email: string) {
    const user = await this.userModel
      .findOne({
        username: email,
        type: 'GOOGLE',
      })
      .populate('role');
    return user;
  }
  //tim user bang email type google
  async createOAuthGoogle(googleUser) {
    const roleClient: any = await this.roleService.findRoleClient();
    const createdUser = new this.userModel({
      username: googleUser.email,
      fullName: googleUser.firstName + ' ' + googleUser.lastName,
      avatar: googleUser.avatar,
      userId: 'GG_' + googleUser.email,
      type: 'GOOGLE',
      role: roleClient._id,
    });

    return createdUser.save();
  }
}
