import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Thread } from '../../thread/entities/thread.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (u) => u.comments, { eager: true, nullable: false })
  createdBy: User;

  @ManyToOne(() => Thread, (t) => t.comments, { onDelete: 'CASCADE' })
  thread: Thread;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({ name: 'comment_tagged_users' })
  taggedUsers: User[];

  @CreateDateColumn()
  createdAt: Date;
}
