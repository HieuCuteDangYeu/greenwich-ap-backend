import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { STAFF_ROLES_KEY } from '../../../common/decorators/staff-roles.decorator';
import { User } from '../../user/entities/user.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { StaffRole } from '../../../common/enums/roles.enum';

// Define a type for User with staff attached
type UserWithStaff = User & { staff?: Staff };

@Injectable()
export class StaffRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredStaffRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      STAFF_ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // If no staff roles are required, allow access
    if (!requiredStaffRoles || requiredStaffRoles.length === 0) return true;

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserWithStaff }>();
    const user = req.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's role is "STAFF"
    if (!user.role || user.role.name.toUpperCase() !== 'STAFF') {
      return true;
    }

    // Check if staff record and staff role exist
    if (!user.staff?.role?.role) {
      throw new ForbiddenException('Staff member has no role assigned');
    }

    const staffRoleName = user.staff.role.role;
    const hasPermission = requiredStaffRoles.includes(
      staffRoleName as StaffRole,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Required staff roles: ${requiredStaffRoles.join(', ')}. Your role: ${staffRoleName}`,
      );
    }

    return true;
  }
}
