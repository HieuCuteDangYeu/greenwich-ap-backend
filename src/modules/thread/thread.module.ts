import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from './entities/thread.entity';
import { Comment } from '../comment/entities/comment.entity';
import { ThreadService } from './thread.service';
import { ThreadController } from './thread.controller';
import { User } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([Thread, Comment, User])],
  providers: [ThreadService, RolesGuard, Reflector],
  controllers: [ThreadController],
})
export class ThreadModule {}
