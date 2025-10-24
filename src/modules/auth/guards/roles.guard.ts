import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../../common/enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user?: User }>();
    const user = req.user;

    // Check if user exists and has a role
    if (!user || !user.role || !user.role.name) {
      throw new ForbiddenException(
        'User not authenticated or has no role assigned',
      );
    }

    const userRoleName = user.role.name.toUpperCase();
    const hasPermission = requiredRoles.some(
      (role) => role.toString() === userRoleName,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
