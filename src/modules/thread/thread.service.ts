import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Thread } from './entities/thread.entity';
import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ThreadService {
  constructor(
    @InjectRepository(Thread) private readonly threadRepo: Repository<Thread>,
    @InjectRepository(Comment)
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<ThreadResponseDto[]> {
    const threads = await this.threadRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'comments', 'taggedUsers'],
    });

    return plainToInstance(ThreadResponseDto, threads, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(threadId: number): Promise<ThreadResponseDto> {
    const t = await this.threadRepo.findOne({
      where: { id: threadId },
      relations: ['createdBy', 'comments', 'taggedUsers'],
    });
    if (!t) throw new NotFoundException('Thread not found');

    return plainToInstance(ThreadResponseDto, t, {
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

    let taggedUsers: User[] = [];
    if (dto.taggedUserIds?.length) {
      const requestIds = dto.taggedUserIds;

      if (dto.taggedUserIds.includes(Number(currentUserId))) {
        throw new ForbiddenException('You cannot tag yourself');
      }
      taggedUsers = await this.userRepo.findBy({ id: In(requestIds) });

      if (taggedUsers.length !== requestIds.length) {
        const foundIds = taggedUsers.map((u) => Number(u.id));
        const missingIds = requestIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Tagged users not found: ${missingIds.join(', ')}`,
        );
      }
    }

    const thread = this.threadRepo.create({
      title: dto.title,
      createdBy: { id: user.id } as User,
      taggedUsers,
    });

    return this.threadRepo.save(thread);
  }
}
