import { Request } from 'express';
import { User } from '../../modules/user/entities/user.entity';
import { Staff } from '../../modules/staff/entities/staff.entity';
import { Student } from '../../modules/student/entities/student.entity';

export interface AuthenticatedRequest extends Request {
  user: User & { staff?: Staff; student?: Student };
}
