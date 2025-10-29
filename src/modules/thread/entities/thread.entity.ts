import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';

@Entity('threads')
export class Thread {
  @SwaggerProperty({
    description: 'Unique identifier for the thread',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @SwaggerProperty({
    description: 'The title of the thread',
    example: 'How to use NestJS with TypeORM?',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @SwaggerProperty({
    description: 'The user who created the thread',
    type: () => User, // NestJS Swagger needs this for nested objects
  })
  @ManyToOne(() => User, (u) => u.threadsCreated, {
    nullable: false,
    eager: true, // Auto-load the creator
  })
  createdBy: User;

  @SwaggerProperty({
    description: 'Comments on the thread',
    type: () => [Comment],
  })
  @OneToMany(() => Comment, (c) => c.thread)
  comments: Comment[];

  @SwaggerProperty({ description: 'The creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @SwaggerProperty({ description: 'The last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
