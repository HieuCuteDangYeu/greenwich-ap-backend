import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClassSession } from '../../class/entities/class-session.entity';

@Entity('time_slot')
export class TimeSlot {
  @ApiProperty({
    description: 'The unique identifier for the time slot.',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The name of the time slot.',
    example: 'Slot 1',
  })
  @Column({ length: 30 })
  name: string;

  @ApiProperty({
    description: 'The start time of the slot (HH:mm:ss).',
    example: '07:30:00',
  })
  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @ApiProperty({
    description: 'The end time of the slot (HH:mm:ss).',
    example: '09:00:00',
  })
  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @OneToMany(() => ClassSession, (session) => session.timeSlot)
  sessions?: ClassSession[];
}
