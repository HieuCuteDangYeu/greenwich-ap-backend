import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Department } from '../department/entities/department.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

interface FindAllOptions {
  page?: number;
  limit?: number;
  departmentId?: number;
  code?: string;
  teacherId?: number;
  level?: string;
  classId?: number;
  studentId?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  async findAll(opts: FindAllOptions = {}) {
    const qb = this.courseRepo.createQueryBuilder('c');

    if (opts.studentId) {
      qb.andWhere(
        `EXISTS (
        SELECT 1
        FROM student_class sc
        JOIN class_course cc ON cc.class_id = sc.class_id
        WHERE sc.student_id = :sid
          AND cc.course_id = c.id
      )`,
        { sid: opts.studentId },
      );
    }

    if (opts.classId) {
      qb.andWhere(
        `EXISTS (
        SELECT 1
        FROM class_course cc
        WHERE cc.class_id = :cid
          AND cc.course_id = c.id
      )`,
        { cid: opts.classId },
      );
    }

    if (opts.departmentId) {
      qb.andWhere('c.department_id = :d', { d: opts.departmentId });
    }

    if (opts.code) {
      qb.andWhere('c.code ILIKE :q', { q: `%${opts.code}%` });
    }

    if (opts.teacherId) {
      qb.andWhere('c.teacher_id = :t', { t: opts.teacherId });
    }

    if (opts.level) {
      qb.andWhere('c.level = :l', { l: opts.level });
    }

    // Sorting
    const sortFieldMap: Record<string, string> = {
      code: 'c.code',
      title: 'c.title',
      level: 'c.level',
      createdAt: 'c.created_at',
      id: 'c.id',
    };
    const sortField = opts.sort || 'id';
    const mappedSortField = sortFieldMap[sortField] || 'c.id';
    const sortOrder = opts.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(mappedSortField, sortOrder).addOrderBy('c.id', sortOrder);

    // Pagination
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 25;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  async findOne(id: number) {
    const ent = await this.courseRepo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException('Course not found');
    return ent;
  }

  async create(dto: CreateCourseDto) {
    // 1) make sure department exists
    const department = await this.deptRepo.findOne({
      where: { id: dto.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    // 2) create a SINGLE entity object (no array [])
    const ent = this.courseRepo.create({
      code: dto.code,
      title: dto.title,
      credits: dto.credits ?? null,
      level: dto.level,
      teacherId: dto.teacherId ?? null,
      slot: dto.slot ?? null,
      // status left to default ('ACTIVE') from your entity
      department, // <-- sets department_id under the hood
    } as DeepPartial<Course>);

    try {
      return await this.courseRepo.save(ent);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Course code already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateCourseDto) {
    const ent = await this.courseRepo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException('Course not found');

    if (dto.departmentId !== undefined) {
      const dept = await this.deptRepo.findOne({
        where: { id: dto.departmentId },
      });
      if (!dept) throw new NotFoundException('Department not found');
      ent.department = dept;
    }

    if (dto.code !== undefined) ent.code = dto.code;
    if (dto.title !== undefined) ent.title = dto.title;
    if (dto.credits !== undefined) ent.credits = dto.credits;
    if (dto.level !== undefined) ent.level = dto.level;
    if (dto.teacherId !== undefined) ent.teacherId = dto.teacherId;
    if (dto.slot !== undefined) ent.slot = dto.slot;
    if (dto.status !== undefined) ent.status = dto.status;

    try {
      return await this.courseRepo.save(ent);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Course code already exists');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.courseRepo.delete(id);
    return { deleted: true };
  }

  async findByDepartment(departmentId: number) {
    return this.courseRepo.find({
      where: { department: { id: departmentId } },
    });
  }
}
