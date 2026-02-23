import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoomBookingDto {
  @ApiProperty({ description: 'Room ID to book' })
  @IsInt()
  roomId!: number;

  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  dateOn!: string;

  @ApiProperty({ description: 'Time slot IDs to book', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  timeSlotIds!: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose?: string;
}
