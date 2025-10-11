import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Thread } from '../thread/entities/thread.entity';
import { User } from '../user/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Thread)
    private readonly threadRepo: Repository<Thread>,
  ) {}

  async createComment(
    currentUserId: number,
    threadId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentRepo.manager.transaction(async (manager) => {
      const thread = await manager.findOne(Thread, {
        where: { id: threadId },
        relations: ['taggedUsers', 'createdBy'],
      });
      if (!thread) throw new NotFoundException('Thread not found');

      const currentUser = await manager.findOne(User, {
        where: { id: currentUserId },
      });
      if (!currentUser) throw new NotFoundException('User not found');

      const isTagged = thread.taggedUsers.some((u) => u.id === currentUserId);
      if (!isTagged) {
        throw new ForbiddenException(
          'You are not tagged in this thread and cannot comment',
        );
      }

      let newlyTaggedUsers: User[] = [];
      if (dto.taggedUserIds && dto.taggedUserIds.length > 0) {
        if (dto.taggedUserIds.includes(Number(currentUserId))) {
          throw new ForbiddenException('You cannot tag yourself');
        }

        newlyTaggedUsers = await manager.find(User, {
          where: { id: In(dto.taggedUserIds) },
        });

        const foundIds = newlyTaggedUsers.map((u) => Number(u.id));
        const missingIds = dto.taggedUserIds.filter(
          (id) => !foundIds.includes(id),
        );
        if (missingIds.length > 0) {
          throw new NotFoundException(
            `Tagged users not found: ${missingIds.join(', ')}`,
          );
        }
      }

      const taggedUsersMap = new Map<number, User>();
      for (const user of thread.taggedUsers) {
        taggedUsersMap.set(user.id, user);
      }
      for (const user of newlyTaggedUsers) {
        taggedUsersMap.set(user.id, user);
      }
      const mergedTaggedUsers = Array.from(taggedUsersMap.values());

      thread.taggedUsers = mergedTaggedUsers;
      await manager.save(Thread, thread);

      const comment = manager.create(Comment, {
        content: dto.content,
        createdBy: currentUser,
        thread,
        taggedUsers: newlyTaggedUsers,
      });

      const savedComment = await manager.save(Comment, comment);
      const completeComment = await manager.findOne(Comment, {
        where: { id: savedComment.id },
        relations: ['createdBy', 'thread', 'taggedUsers'],
      });

      return plainToInstance(CommentResponseDto, completeComment, {
        excludeExtraneousValues: true,
      });
    });
  }

  async findByThread(threadId: number): Promise<CommentResponseDto[]> {
    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const comments = await this.commentRepo.find({
      where: { thread: { id: threadId } },
      relations: ['createdBy', 'taggedUsers', 'thread'],
      order: { createdAt: 'ASC' },
    });

    return plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });
  }
}
