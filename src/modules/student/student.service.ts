import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Class } from '../class/entities/class.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,

    private readonly userService: UserService,
  ) {}

  // CREATE
  async create(dto: CreateStudentDto): Promise<Student> {
    return await this.studentRepo.manager.transaction(async (manager) => {
      let user: User;

      // If not having userID, add new user
      if (!dto.userId) {
        if (!dto.email) throw new BadRequestException('Email is required');

        // Check existing email
        const existingEmail = await this.userService.findByEmail(dto.email);
        if (existingEmail)
          throw new BadRequestException('Email already exists');

        const role = await this.userService.findRoleByName('Student');

        // Only hash password if user is newly created
        const hashed = dto.password
          ? await bcrypt.hash(dto.password, 10)
          : null;

        // Create user using same transaction
        user = manager.create(User, {
          email: dto.email,
          password: hashed ?? undefined,
          givenName: dto.givenName,
          surname: dto.surname,
          campusId: dto.campusId,
          roleId: role.id,
        });
        await manager.save(user);
      } else {
        user = await this.userService.findOne(dto.userId);
        if (!user)
          throw new NotFoundException(`User with ID ${dto.userId} not found`);
        if (user.role?.name !== 'Student') {
          throw new BadRequestException('User must have Student role');
        }
      }

      // Check student code
      const studentCode =
        dto.studentCode ?? `FGW${user.id.toString().padStart(5, '0')}`;
      const existing = await manager.findOne(Student, {
        where: { studentCode },
      });
      if (existing)
        throw new BadRequestException('Student code already exists');

      // Check mentor
      let mentor: User | null = null;
      if (dto.mentorId) {
        mentor = await this.userService.findOne(dto.mentorId);
        if (!mentor) throw new NotFoundException('Mentor not found');
      }

      // Check class
      if (dto.classId) {
        const existingClass = await manager.findOne(Class, {
          where: { id: dto.classId },
        });
        if (!existingClass) throw new NotFoundException('Class not found');
      }

      // Create new student in same transaction
      const student = manager.create(Student, {
        ...dto,
        studentCode,
        user,
        mentor,
      });

      return await manager.save(student);
    });
  }

  // READ all with filters
  async findAll(filter?: {
    campusId?: number;
    mentorId?: number;
    status?: string;
    academicYear?: string;
  }): Promise<Student[]> {
    const qb = this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.mentor', 'm')
      .orderBy('s.createdAt', 'DESC');

    if (filter?.campusId) {
      qb.andWhere('u.campusId = :campusId', { campusId: filter.campusId });
    }

    if (filter?.mentorId) {
      qb.andWhere('s.mentorId = :mentorId', { mentorId: filter.mentorId });
    }

    if (filter?.status) {
      qb.andWhere('s.status = :status', { status: filter.status });
    }

    if (filter?.academicYear) {
      qb.andWhere('s.academicYear = :academicYear', {
        academicYear: filter.academicYear,
      });
    }

    return qb.getMany();
  }

  // READ one
  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'mentor'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // READ by user ID
  async findByUserId(userId: number): Promise<Student | null> {
    const student = await this.studentRepo.findOne({
      where: { userId },
      relations: ['user', 'mentor'],
    });
    return student;
  }

  async update(
    id: number,
    dto: UpdateStudentDto,
  ): Promise<{ success: boolean }> {
    const student = await this.findOne(id);

    // --- Update mentor ---
    if (dto.mentorId) {
      const mentor = await this.userService.findOne(dto.mentorId);
      if (!mentor) throw new NotFoundException('Mentor not found');
      student.mentor = mentor;
    }

    // --- Update class ---
    if (dto.classId) {
      const existingClass = await this.classRepo.findOne({
        where: { id: dto.classId },
      });
      if (!existingClass) throw new NotFoundException('Class not found');
      student.class = existingClass;
    }

    // --- Other fields ---
    if (dto.academicYear !== undefined)
      student.academicYear = dto.academicYear ?? null;

    if (dto.enrolmentDay !== undefined)
      student.enrolmentDay = dto.enrolmentDay
        ? new Date(dto.enrolmentDay)
        : undefined;

    if (dto.status !== undefined) student.status = dto.status;

    await this.studentRepo.save(student);
    return { success: true };
  }

  // DELETE (soft: set status = INACTIVE)
  async deactivate(id: number): Promise<Student> {
    const student = await this.findOne(id);
    if (!student) {
      throw new NotFoundException(`Student not found`);
    }

    await this.userService.deactivate(student.user.id);
    return await this.studentRepo.save(student);
  }
}
