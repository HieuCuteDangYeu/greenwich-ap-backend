import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Term } from './entities/term.entity';
import { Programme } from '../programme/entities/programme.entity';
import { Department } from '../department/entities/department.entity';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  programmeId?: number;
  departmentId?: number;
  academicYear?: string;
  code?: string;
  name?: string;
}

@Injectable()
export class TermService {
  private readonly DEFAULT_LIMIT = 25;
  private readonly MAX_LIMIT = 100;
  constructor(
    @InjectRepository(Term)
    private readonly termRepo: Repository<Term>,
    @InjectRepository(Programme)
    private readonly programmeRepo: Repository<Programme>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async findAll(opts: FindAllOptions = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const requestedLimit =
      opts.limit && opts.limit > 0 ? opts.limit : this.DEFAULT_LIMIT;
    const limit = Math.min(requestedLimit, this.MAX_LIMIT);

    const baseQuery = this.termRepo
      .createQueryBuilder('term')
      .leftJoin('term.departments', 'department');

    if (opts.programmeId) {
      baseQuery.andWhere('term.programme_id = :programmeId', {
        programmeId: opts.programmeId,
      });
    }
    if (opts.departmentId) {
      baseQuery.andWhere('department.id = :departmentId', {
        departmentId: opts.departmentId,
      });
    }
    if (opts.academicYear) {
      baseQuery.andWhere('term.academic_year = :academicYear', {
        academicYear: opts.academicYear,
      });
    }
    if (opts.code) {
      baseQuery.andWhere('term.code ILIKE :code', {
        code: `%${opts.code}%`,
      });
    }
    if (opts.name) {
      baseQuery.andWhere('term.name ILIKE :name', {
        name: `%${opts.name}%`,
      });
    }

    const idQuery = baseQuery
      .clone()
      .select(['term.id AS term_id', 'term.start_date AS term_start_date'])
      .distinct(true)
      .orderBy('term.start_date', 'DESC')
      .addOrderBy('term.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const rows = await idQuery.getRawMany<{ term_id: bigint }>();
    const ids = rows.map((row) => Number(row.term_id));

    if (ids.length === 0) {
      return [];
    }

    const terms = await this.termRepo.find({
      where: { id: In(ids) },
      relations: ['programme', 'departments'],
    });

    const orderMap = new Map<number, number>(
      ids.map((id, index) => [id, index]),
    );

    return terms
      .slice()
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  }

  async findOne(id: number) {
    const term = await this.termRepo.findOne({
      where: { id },
      relations: ['programme', 'departments'],
    });
    if (!term) {
      throw new NotFoundException(`Term ${id} not found`);
    }
    return term;
  }

  async create(dto: CreateTermDto) {
    const programme = await this.programmeRepo.findOne({
      where: { id: dto.programmeId },
    });
    if (!programme) {
      throw new NotFoundException('Programme not found');
    }

    const departments = await this.loadDepartments(dto.departmentIds);

    const entity = this.termRepo.create({
      programme,
      programmeId: programme.id,
      code: dto.code,
      name: dto.name,
      academicYear: dto.academicYear ?? null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      departments,
    } as DeepPartial<Term>);

    try {
      const saved = await this.termRepo.save(entity);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleUniqueViolation(
        error,
        'A term with the same (programme_id, code) already exists.',
      );
      throw error;
    }
  }

  async update(id: number, dto: UpdateTermDto) {
    const term = await this.termRepo.findOne({
      where: { id },
      relations: ['programme', 'departments'],
    });
    if (!term) {
      throw new NotFoundException('Term not found');
    }

    if (dto.programmeId !== undefined && dto.programmeId !== term.programmeId) {
      const programme = await this.programmeRepo.findOne({
        where: { id: dto.programmeId },
      });
      if (!programme) {
        throw new NotFoundException('Programme not found');
      }
      term.programme = programme;
      term.programmeId = programme.id;
    }

    this.termRepo.merge(term, {
      code: dto.code,
      name: dto.name,
      academicYear: dto.academicYear,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    if (dto.departmentIds !== undefined) {
      const departments = await this.loadDepartments(dto.departmentIds);
      term.departments = departments;
    }

    try {
      const saved = await this.termRepo.save(term);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleUniqueViolation(
        error,
        'A term with the same (programme_id, code) already exists.',
      );
      throw error; // fallback
    }
  }

  async remove(id: number) {
    const result = await this.termRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Term not found');
    }
    return { deleted: true };
  }

  private async loadDepartments(ids?: number[]) {
    if (!ids || ids.length === 0) {
      return [];
    }

    const departments = await this.departmentRepo.find({
      where: { id: In(ids) },
    });

    if (departments.length !== ids.length) {
      const foundIds = new Set(departments.map((dept) => dept.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Departments not found: ${missing.map((id) => `#${id}`).join(', ')}`,
      );
    }

    return departments;
  }

  private handleUniqueViolation(error: unknown, message: string): void {
    if (typeof error === 'object' && error !== null) {
      const pgError = error as {
        code?: string;
        driverError?: {
          code?: string;
        };
      };

      const code: string | undefined =
        pgError.code ?? pgError.driverError?.code;

      if (code === '23505') {
        throw new ConflictException(message);
      }
    }
  }
}
