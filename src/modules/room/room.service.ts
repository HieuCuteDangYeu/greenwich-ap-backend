import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from '../user/entities/campus.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectRepository(Campus) private readonly campusRepo: Repository<Campus>,
  ) {}

  async findAll(opts?: {
    page?: number;
    limit?: number;
    campusId?: number;
    search?: string;
  }) {
    const qb = this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.campus', 'campus')
      .orderBy('room.code', 'ASC');

    if (opts?.campusId) {
      qb.andWhere('room.campus_id = :campusId', { campusId: opts.campusId });
    }

    if (opts?.search) {
      qb.andWhere('(room.code ILIKE :q OR room.name ILIKE :q)', {
        q: `%${opts.search}%`,
      });
    }

    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit = opts?.limit && opts.limit > 0 ? opts.limit : 25;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  async findOne(id: number) {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['campus'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async create(dto: CreateRoomDto) {
    const campus = await this.campusRepo.findOne({
      where: { id: dto.campusId },
    });
    if (!campus) {
      throw new NotFoundException('Campus not found');
    }

    const room = this.roomRepo.create({
      campus,
      campusId: campus.id,
      code: dto.code,
      name: dto.name,
      capacity: dto.capacity,
      floor: dto.floor,
      note: dto.note ?? null,
    });

    try {
      return await this.roomRepo.save(room);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Room code already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.findOne(id);

    if (dto.campusId !== undefined) {
      const campus = await this.campusRepo.findOne({
        where: { id: dto.campusId },
      });
      if (!campus) {
        throw new NotFoundException('Campus not found');
      }
      room.campus = campus;
      room.campusId = campus.id;
    }

    if (dto.code !== undefined) room.code = dto.code;
    if (dto.name !== undefined) room.name = dto.name;
    if (dto.capacity !== undefined) room.capacity = dto.capacity;
    if (dto.floor !== undefined) room.floor = dto.floor;
    if (dto.note !== undefined) room.note = dto.note ?? null;

    try {
      return await this.roomRepo.save(room);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Room code already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.roomRepo.delete(id);
    return { deleted: true };
  }
}
