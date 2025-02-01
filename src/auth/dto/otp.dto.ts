import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class SendOtpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
export class VerifyOtpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
