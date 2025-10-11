import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Campus } from './campus.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Thread } from '../../thread/entities/thread.entity';
import { Comment } from '../../comment/entities/comment.entity';

@Entity({ name: 'user_account' })
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty()
  @Column({ name: 'role_id', type: 'bigint', nullable: false })
  roleId!: number;

  @ManyToOne(() => Role, (r) => r.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ApiProperty()
  @Column({ name: 'campus_id', type: 'bigint', nullable: true })
  campusId?: number | null;

  @ManyToOne(() => Campus, (c) => c.users, { eager: true, nullable: true })
  @JoinColumn({ name: 'campus_id' })
  campus?: Campus | null;

  @ApiProperty()
  @Column({ length: 190, unique: true })
  email!: string;

  @ApiProperty({ description: 'Hashed password', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string | null;

  @ApiProperty({ name: 'phone_alt', required: false })
  @Column({ name: 'phone_alt', type: 'varchar', length: 30, nullable: true })
  phoneAlt?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 80, nullable: true })
  surname?: string | null;

  @ApiProperty({ name: 'middle_name', required: false })
  @Column({ name: 'middle_name', type: 'varchar', length: 80, nullable: true })
  middleName?: string | null;

  @ApiProperty({ name: 'given_name', required: false })
  @Column({ name: 'given_name', type: 'varchar', length: 80, nullable: true })
  givenName?: string | null;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'] })
  @Column({
    type: 'enum',
    enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'],
    default: 'UNSPECIFIED',
  })
  gender!: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';

  @ApiProperty({ required: false })
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 300, nullable: true })
  avatar?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'INACTIVE';

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  refreshToken?: string | null;

  @Column({
    name: 'refresh_token_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  refreshTokenExpiresAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Thread, (thread) => thread.createdBy)
  threadsCreated!: Thread[];

  @OneToMany(() => Comment, (comment) => comment.createdBy)
  comments!: Comment[];
}
