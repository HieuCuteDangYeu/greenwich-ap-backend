import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class UserInStaffDto extends OmitType(CreateUserDto, [
  'roleId',
] as const) {}
