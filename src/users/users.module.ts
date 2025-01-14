import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { RolesModule } from 'src/roles/roles.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { SingersModule } from 'src/singers/singers.module';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => RolesModule),
    CloudinaryModule,
    forwardRef(() => SingersModule),
    forwardRef(() => PlaylistModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
