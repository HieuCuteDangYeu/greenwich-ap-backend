import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRescheduleRequestDto {
  @ApiProperty({ description: 'Class session ID' })
  @IsInt()
  sessionId!: number;

  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  newDateOn!: string;

  @ApiProperty({ description: 'New time slot ID' })
  @IsInt()
  newTimeSlotId!: number;

  @ApiProperty({ description: 'New room ID' })
  @IsInt()
  newRoomId!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
