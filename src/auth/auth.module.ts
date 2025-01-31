import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from 'src/mailer/mailer.module';
import { TokenService } from './token.service';
@Module({
  imports: [UserModule, JwtModule.register({}), MailerModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, TokenService],
})
export class AuthModule {}
