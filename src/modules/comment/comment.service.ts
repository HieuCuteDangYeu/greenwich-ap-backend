import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
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
        relations: ['createdBy'],
      });
      if (!thread) throw new NotFoundException('Thread not found');

      const currentUser = await manager.findOne(User, {
        where: { id: currentUserId },
      });
      if (!currentUser) throw new NotFoundException('User not found');

      const isThreadCreator = thread.createdBy.id === currentUserId;
      const isTagged = await manager
        .getRepository(Comment)
        .createQueryBuilder('comment')
        .leftJoin('comment.taggedUsers', 'taggedUser')
        .where('comment.thread.id = :threadId', { threadId })
        .andWhere('taggedUser.id = :currentUserId', { currentUserId })
        .getExists();

      if (!isThreadCreator && !isTagged) {
        throw new ForbiddenException(
          'You must be the thread creator or previously tagged in this thread to post a comment.',
        );
      }

      let newlyTaggedUsers: any[] = [];
      if (dto.taggedUserIds && dto.taggedUserIds.length > 0) {
        if (dto.taggedUserIds.map(Number).includes(Number(currentUserId))) {
          throw new ForbiddenException('You cannot tag yourself');
        }

        newlyTaggedUsers = await manager.find(User, {
          where: { id: In(dto.taggedUserIds) },
        });

        const foundIds = newlyTaggedUsers.map((u) => Number(u.id));
        const missingIds = dto.taggedUserIds.filter(
          (id) => !foundIds.includes(Number(id)),
        );
        if (missingIds.length > 0) {
          throw new NotFoundException(
            `Tagged users not found: ${missingIds.join(', ')}`,
          );
        }
      }

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

  async findByThread(
    currentUserId: number,
    threadId: number,
  ): Promise<CommentResponseDto[]> {
    const thread = await this.threadRepo
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.createdBy', 'createdBy')
      .leftJoin('thread.comments', 'comments')
      .leftJoin('comments.taggedUsers', 'taggedUsers')
      .where('thread.id = :threadId', { threadId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('createdBy.id = :currentUserId', { currentUserId }).orWhere(
            'taggedUsers.id = :currentUserId',
            { currentUserId },
          );
        }),
      )
      .getOne();

    if (!thread) {
      throw new ForbiddenException(
        'You do not have permission to view this thread',
      );
    }

    const comments = await this.commentRepo.find({
      where: { thread: { id: threadId } },
      relations: ['createdBy', 'taggedUsers', 'thread'],
      order: { createdAt: 'ASC' },
    });

    return plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });
  }

  async deleteComment(currentUserId: number, commentId: number): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['createdBy', 'thread'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const isCommentAuthor = comment.createdBy.id === currentUserId;

    if (!isCommentAuthor) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.remove(comment);
  }
}
