import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: 'INACTIVE' })
  @IsEnum(UserStatus)
  status: UserStatus;
}
