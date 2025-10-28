import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Term } from '../../term/entities/term.entity';

@Entity({ name: 'programme' })
export class Programme {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty()
  @Column({ length: 20, unique: true })
  code!: string;

  @ApiProperty()
  @Column({ length: 150 })
  name!: string;

  @ApiProperty({ type: () => [Term], readOnly: true })
  @OneToMany(() => Term, (term) => term.programme)
  terms?: Term[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
