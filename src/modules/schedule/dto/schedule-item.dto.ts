import { ApiProperty } from '@nestjs/swagger';

export class ScheduleItemDto {
  @ApiProperty({ enum: ['CLASS_SESSION', 'ROOM_BOOKING'] })
  type!: 'CLASS_SESSION' | 'ROOM_BOOKING';

  @ApiProperty({ type: String, format: 'date' })
  dateOn!: string;

  @ApiProperty()
  roomId!: number;

  @ApiProperty()
  timeSlotId!: number;

  @ApiProperty({ required: false })
  classId?: number;

  @ApiProperty({ required: false })
  courseId?: number;

  @ApiProperty({ required: false })
  teacherId?: number;

  @ApiProperty({ required: false })
  sessionId?: number;

  @ApiProperty({ required: false })
  bookingId?: number;

  @ApiProperty({ required: false })
  requesterUserId?: number;
}
