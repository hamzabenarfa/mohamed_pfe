import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Tokens } from './types';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<Tokens> {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.AT_SECRET, expiresIn: '60m' },
      ),
    ]);
    return { access_token: accessToken };
  }
}
