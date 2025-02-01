import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(
    private prisma: DatabaseService,
    private reflector: Reflector, // Inject Reflector to access metadata
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Skip the guard for public routes
    }

    const request = context.switchToHttp().getRequest();
    const user = await this.prisma.user.findUnique({
      where: { email: request.user.email }, // Assuming the user is attached to the request after authentication
    });

    if (!user || !user.active) {
      throw new ForbiddenException(
        'Your account is not activated. Please activate your account to proceed.',
      );
    }

    return true;
  }
}
