import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SingersModule } from './singers/singers.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SongsModule } from './songs/songs.module';
import { TopicsModule } from './topics/topics.module';
import { PlaylistModule } from './playlist/playlist.module';
import { SongForYouModule } from './song-for-you/song-for-you.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // path to your 'public' folder
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SingersModule,
    AuthModule,
    UserModule,
    PermissionsModule,
    RolesModule,
    SongsModule,
    TopicsModule,
    PlaylistModule,
    SongForYouModule,
    ForgotPasswordModule,
    PaymentModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
