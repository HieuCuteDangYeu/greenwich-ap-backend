import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Campus that owns the room' })
  @IsInt()
  campusId!: number;

  @ApiProperty({ description: 'Unique room code' })
  @IsString()
  @MaxLength(40)
  code!: string;

  @ApiProperty({ description: 'Human readable room name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Number of seats available in the room' })
  @IsInt()
  @Min(0)
  capacity!: number;

  @ApiProperty({ description: 'Floor where the room is located' })
  @IsInt()
  floor!: number;

  @ApiProperty({ description: 'Optional note about the room', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
