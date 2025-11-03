import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StaffRole } from './staff_role.entity';

@Entity({ name: 'staff' })
export class Staff {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to user account' })
  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId!: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToOne(() => StaffRole, (role) => role.staff, {
    nullable: true,
  })
  role?: StaffRole | null;

  @ApiProperty()
  @Column({
    name: 'staff_code',
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  staffCode!: string;

  @ApiProperty({ description: 'Hire Date' })
  @Column({ name: 'hire_date', type: 'timestamp', nullable: false })
  hireDate!: Date;

  @ApiProperty({ description: 'End Date' })
  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE', 'SABBATICAL', 'LEFT'],
  })
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SABBATICAL', 'LEFT'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'INACTIVE' | 'SABBATICAL' | 'LEFT';

  @ApiProperty()
  @Column({
    name: 'notes',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
