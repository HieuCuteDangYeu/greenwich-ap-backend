import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Programme } from '../programme/entities/programme.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department) private repo: Repository<Department>,
    @InjectRepository(Programme) private programmeRepo: Repository<Programme>,
  ) {}

  async findAll(opts?: {
    page?: number;
    limit?: number;
    search?: string;
    programmeId?: number;
  }) {
    // Validate programmeId exists if provided
    if (opts?.programmeId) {
      const programmeExists = await this.programmeRepo.exists({
        where: { id: opts.programmeId },
      });
      if (!programmeExists) {
        throw new NotFoundException('Programme not found');
      }
    }

    const qb = this.repo.createQueryBuilder('d');

    if (opts?.programmeId) {
      qb.innerJoin('term_department', 'td', 'td.department_id = d.id')
        .innerJoin('term', 't', 't.id = td.term_id')
        .andWhere('t.programme_id = :programmeId', {
          programmeId: opts.programmeId,
        })
        .distinct(true);
    }

    if (opts?.search) {
      qb.andWhere('(d.code ILIKE :q OR d.name ILIKE :q)', {
        q: `%${opts.search}%`,
      });
    }

    qb.orderBy('d.createdAt', 'DESC');
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit = opts?.limit && opts.limit > 0 ? opts.limit : 25;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  /** Get one department or throw 404. */
  async findOne(id: number) {
    const dept = await this.repo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  /** Create a new department; catch duplicate code errors. */
  async create(dto: CreateDepartmentDto) {
    try {
      const entity = this.repo.create(dto as Department);
      return await this.repo.save(entity);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Department code already exists');
      }
      throw e;
    }
  }

  /** Update an existing department. */
  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.findOne(id);
    Object.assign(dept, dto);
    return this.repo.save(dept);
  }

  /** Delete a department by id. */
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { deleted: true };
  }
}
