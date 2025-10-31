import { Expose, Type } from 'class-transformer';
import { RoleDto } from '../../auth/dto/me-response.dto';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string;

  @Type(() => RoleDto)
  @Expose()
  role: RoleDto;
}
