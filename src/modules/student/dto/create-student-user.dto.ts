// create-student-user.dto.ts
import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateStudentUserDto extends OmitType(CreateUserDto, [
  'roleId',
] as const) {}
