import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { DatabaseService } from 'src/database/database.service';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: DatabaseService) {}

  async findAllUsers() {
    return await this.prisma.user.findMany();
  }
  async createUser(signupData: SignupDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: signupData.email },
    });
    if (userExist) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await argon2.hash(signupData.password);
    await this.prisma.user.create({
      data: {
        ...signupData,
        password: hashedPassword,
      },
    });

    return { message: 'User created successfully' };
  }
}
