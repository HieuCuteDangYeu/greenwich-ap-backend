import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class RoleDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;
}

class CampusDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  location: string;
}

class StaffRoleDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  role: string;
}

class StaffDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  staffCode: string;

  @ApiProperty({ type: StaffRoleDto })
  @Expose()
  @Type(() => StaffRoleDto)
  role: StaffRoleDto;
}

class StudentDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  studentCode: string;

  @ApiProperty()
  @Expose()
  faculty: string;

  @ApiProperty()
  @Expose()
  academicYear: string;
}

export class MeResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ required: false })
  @Expose()
  surname?: string;

  @ApiProperty({ required: false })
  @Expose()
  givenName?: string;

  @ApiProperty({ required: false })
  @Expose()
  avatar?: string;

  @ApiProperty({ type: RoleDto })
  @Expose()
  @Type(() => RoleDto)
  role: RoleDto;

  @ApiProperty({ type: CampusDto })
  @Expose()
  @Type(() => CampusDto)
  campus: CampusDto;

  @ApiProperty({ type: StaffDto, required: false })
  @Expose()
  @Type(() => StaffDto)
  staff?: StaffDto;

  @ApiProperty({ type: StudentDto, required: false })
  @Expose()
  @Type(() => StudentDto)
  student?: StudentDto;
}
