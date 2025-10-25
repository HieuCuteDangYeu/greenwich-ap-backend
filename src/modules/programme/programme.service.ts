import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programme } from './entities/programme.entity';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class ProgrammeService {
  private readonly DEFAULT_LIMIT = 25;
  private readonly MAX_LIMIT = 100;

  constructor(
    @InjectRepository(Programme)
    private readonly repo: Repository<Programme>,
  ) {}

  async findAll(opts: FindAllOptions = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const requestedLimit =
      opts.limit && opts.limit > 0 ? opts.limit : this.DEFAULT_LIMIT;
    const limit = Math.min(requestedLimit, this.MAX_LIMIT);

    const qb = this.repo.createQueryBuilder('programme');

    if (opts.search) {
      qb.andWhere('(programme.code ILIKE :q OR programme.name ILIKE :q)', {
        q: `%${opts.search}%`,
      });
    }

    qb.orderBy('programme.created_at', 'DESC')
      .addOrderBy('programme.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getMany();
  }

  async findOne(id: number) {
    const programme = await this.repo.findOne({
      where: { id },
      relations: { terms: true },
      order: {
        terms: {
          startDate: 'DESC',
          id: 'DESC',
        },
      },
    });

    if (!programme) {
      throw new NotFoundException('Programme not found');
    }

    return programme;
  }

  async create(dto: CreateProgrammeDto) {
    try {
      const entity = this.repo.create(dto as Programme);
      const saved = await this.repo.save(entity);
      return this.findOne(saved.id);
    } catch (error) {
      throw this.mapUniqueViolation(error);
    }
  }

  async update(id: number, dto: UpdateProgrammeDto) {
    const programme = await this.repo.findOne({ where: { id } });
    if (!programme) {
      throw new NotFoundException('Programme not found');
    }

    this.repo.merge(programme, dto);

    try {
      const saved = await this.repo.save(programme);
      return this.findOne(saved.id);
    } catch (error) {
      throw this.mapUniqueViolation(error);
    }
  }

  async remove(id: number) {
    try {
      const result = await this.repo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Programme not found');
      }
    } catch (error) {
      throw this.mapForeignKeyViolation(error);
    }

    return { deleted: true };
  }

  private mapUniqueViolation(error: unknown): Error {
    const code = this.extractErrorCode(error);
    if (code === '23505') {
      return new ConflictException('Programme code already exists');
    }

    return this.normalizeError(error);
  }

  private mapForeignKeyViolation(error: unknown): Error {
    const code = this.extractErrorCode(error);
    if (code === '23503') {
      return new ConflictException(
        'Programme cannot be deleted because it has related terms.',
      );
    }

    return this.normalizeError(error);
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (typeof error === 'object' && error !== null) {
      const withCode = error as {
        code?: string;
        driverError?: { code?: string };
      };
      return withCode.code ?? withCode.driverError?.code;
    }
    return undefined;
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Unexpected database error');
  }
}
