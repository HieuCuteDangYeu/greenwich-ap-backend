import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './entities/thread.entity';
import { User } from '../user/entities/user.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { plainToInstance } from 'class-transformer';
import { Brackets } from 'typeorm';

@Injectable()
export class ThreadService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepo: Repository<Thread>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(userId: number): Promise<ThreadResponseDto[]> {
    const threads = await this.threadRepo
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.createdBy', 'createdBy')
      .leftJoinAndSelect('thread.comments', 'comments')
      .leftJoinAndSelect('comments.taggedUsers', 'taggedUsers')
      .where(
        new Brackets((qb) => {
          qb.where('createdBy.id = :userId', { userId }).orWhere(
            'taggedUsers.id = :userId',
            { userId },
          );
        }),
      )
      .orderBy('thread.createdAt', 'DESC')
      .distinct(true)
      .getMany();

    return plainToInstance(ThreadResponseDto, threads, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(
    threadId: number,
    currentUserId: number,
  ): Promise<ThreadResponseDto> {
    const thread = await this.threadRepo
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.createdBy', 'createdBy')
      .leftJoinAndSelect('thread.comments', 'comments')
      .leftJoinAndSelect('comments.taggedUsers', 'taggedUsers')
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
      throw new NotFoundException(
        'Thread not found or you do not have permission to view it',
      );
    }

    return plainToInstance(ThreadResponseDto, thread, {
      excludeExtraneousValues: true,
    });
  }

  async createThread(
    currentUserId: number,
    dto: CreateThreadDto,
  ): Promise<Thread> {
    const user = await this.userRepo.findOne({
      where: { id: currentUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    const thread = this.threadRepo.create({
      title: dto.title,
      createdBy: { id: user.id },
    });

    return this.threadRepo.save(thread);
  }

  async deleteThread(
    currentUserId: number,
    threadId: number,
  ): Promise<{ message: string }> {
    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
      relations: ['createdBy'],
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.createdBy.id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own threads');
    }

    await this.threadRepo.remove(thread);

    return { message: 'Thread deleted successfully' };
  }
}
