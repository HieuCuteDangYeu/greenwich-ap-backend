import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/user/entities/user.entity';
import { Staff } from '../../modules/staff/entities/staff.entity';
import { Student } from '../../modules/student/entities/student.entity';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): User & { staff?: Staff; student?: Student } => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as User & { staff?: Staff; student?: Student };
  },
);
