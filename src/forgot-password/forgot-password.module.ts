import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ForgotPassword, ForgotPasswordSchema } from './forgot-password.schema';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForgotPassword.name, schema: ForgotPasswordSchema },
    ]),
    UserModule,
  ],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
