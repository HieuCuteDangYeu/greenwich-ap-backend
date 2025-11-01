import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SetStaffRoleDto } from './set-staff-role.dto';
import { UserInStaffDto } from './user-in-staff.dto';

export class CreateStaffDto {
  @ApiProperty({
    description: 'User Info',
    type: () => UserInStaffDto,
  })
  @ValidateNested()
  @Type(() => UserInStaffDto)
  @IsNotEmpty()
  user!: UserInStaffDto;

  @ApiProperty({
    description: 'Unique staff code',
    required: true,
    example: 'FGWS001',
  })
  @IsNotEmpty()
  @IsString()
  staffCode!: string;

  @ApiProperty({
    description: 'Staff role info',
    type: () => SetStaffRoleDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => SetStaffRoleDto)
  @IsOptional()
  staffRole?: SetStaffRoleDto;

  @ApiProperty({ required: true, example: '2023-09-01' })
  @IsNotEmpty()
  @IsDateString()
  hireDate!: string;

  @ApiProperty({ required: false, example: '2028-09-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE', 'SABBATICAL', 'LEFT'],
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SABBATICAL', 'LEFT'])
  status?: 'ACTIVE' | 'INACTIVE' | 'SABBATICAL' | 'LEFT';

  @ApiProperty({ required: false, example: 'new teacher' })
  @IsOptional()
  @IsString()
  notes?: string;
}
