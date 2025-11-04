import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassSession } from '../../class/entities/class-session.entity';
import { Campus } from '../../user/entities/campus.entity';

@Entity({ name: 'room' })
export class Room {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to the campus' })
  @Column({ name: 'campus_id', type: 'bigint' })
  campusId!: number;

  @ManyToOne(() => Campus, (campus) => campus.rooms, { nullable: false })
  @JoinColumn({ name: 'campus_id' })
  campus!: Campus;

  @ApiProperty({ description: 'Unique room code' })
  @Column({ length: 40, unique: true })
  code!: string;

  @ApiProperty({ description: 'Human readable room name' })
  @Column({ length: 100 })
  name!: string;

  @ApiProperty({ description: 'Room capacity (number of seats)' })
  @Column({ type: 'int' })
  capacity!: number;

  @ApiProperty({ description: 'Floor where the room is located' })
  @Column({ type: 'int' })
  floor!: number;

  @ApiProperty({
    description: 'Optional notes about the room',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  note?: string | null;

  @OneToMany(() => ClassSession, (session) => session.room)
  sessions?: ClassSession[];
}
