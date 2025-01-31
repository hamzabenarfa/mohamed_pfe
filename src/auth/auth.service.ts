import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { SignupDto } from './dto/signup.dto';
import { Tokens } from './types';
import { MailerService } from 'src/mailer/mailer.service';
import { TokenService } from './token.service';
import { authenticator } from 'otplib';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async otpSend(data): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otp = authenticator.generate(process.env.OTP_SECRET);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry: expiry },
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    return true;
  }

  async otpVerify(email: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.otp || !user.otpExpiry) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check OTP and expiry time
    if (user.otp !== code || user.otpExpiry < new Date()) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Activate account and clear OTP fields
    await this.prisma.user.update({
      where: { id: user.id },
      data: { active: true, otp: null, otpExpiry: null },
    });

    return true;
  }

  async login(loginData: LoginDto): Promise<Tokens> {
    const userExist = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });
    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await argon2.verify(
      userExist.password,
      loginData.password,
    );
    if (!passwordMatch) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    const tokens = await this.tokenService.generateTokens(
      userExist.id.toString(),
      userExist.email,
      userExist.role,
    );

    return tokens;
  }

  async signup(signupData: SignupDto): Promise<Tokens> {
    const userExist = await this.prisma.user.findUnique({
      where: { email: signupData.email },
    });
    if (userExist) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await argon2.hash(signupData.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...signupData,
        password: hashedPassword,
      },
    });

    const tokens = await this.tokenService.generateTokens(
      newUser.id.toString(),
      newUser.email,
      newUser.role,
    );

    await this.mailerService.sendMail({
      to: newUser.email,
      subject: 'Account Created',
      text: 'Your account has been created successfully',
    });

    return tokens;
  }
}
