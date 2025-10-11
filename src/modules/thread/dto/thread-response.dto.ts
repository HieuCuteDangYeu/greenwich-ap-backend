import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ThreadResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Type(() => UserResponseDto)
  @Expose()
  createdBy: UserResponseDto;

  @ApiProperty()
  @Type(() => UserResponseDto)
  @Expose()
  taggedUsers: UserResponseDto[];
}
