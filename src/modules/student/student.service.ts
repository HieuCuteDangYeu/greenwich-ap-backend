import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { UserService } from '../user/user.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Class } from '../class/entities/class.entity';
import { UserStatus } from '../user/dto/update-user-status.dto';
import { StudentProfileDto } from './dto/student-profile.dto';
import { StaffService } from '../staff/staff.service';
import { Staff } from '../staff/entities/staff.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,

    private readonly userService: UserService,

    private readonly staffService: StaffService,
  ) {}

  // CREATE
  async create(dto: CreateStudentDto): Promise<Student> {
    // Check student code
    const studentCode =
      dto.studentCode ?? `FGW${Date.now().toString().slice(-5)}`;
    const existing = await this.studentRepo.findOne({ where: { studentCode } });
    if (existing) throw new BadRequestException('Student code already exists');

    // Check mentor
    let mentor: Staff | null = null;
    if (dto.mentorId) {
      mentor = await this.staffService.findOne(dto.mentorId);
    }

    // Check class
    let classEnt: Class | null = null;
    if (dto.classId) {
      classEnt = await this.classRepo.findOne({ where: { id: dto.classId } });
      if (!classEnt) throw new NotFoundException('Class not found');
    }

    // Create new user
    const user = await this.userService.create({
      ...dto.user,
      roleId: (await this.userService.findRoleByName('Student')).id,
    });

    // Create new student
    try {
      const student = this.studentRepo.create({
        ...dto,
        studentCode,
        user,
        mentor,
      });
      return await this.studentRepo.save(student);
    } catch (error) {
      await this.userService.delete(user.id);
      throw error;
    }
  }

  // READ all with filters
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const qb = this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('u.campus', 'campus')
      .leftJoinAndSelect('s.mentor', 'mentor')
      .leftJoinAndSelect('s.class', 'class');

    // Search by student code, full name or email
    if (opts?.search) {
      qb.where(
        's.studentCode ILIKE :q OR u.fullName ILIKE :q OR u.email ILIKE :q',
        { q: `%${opts.search}%` },
      );
    }
    qb.orderBy('s.createdAt', 'DESC');
    if (opts?.limit) qb.take(opts.limit);
    if (opts?.page && opts.page > 0 && opts.limit)
      qb.skip((opts.page - 1) * opts.limit);

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

  // GET Student Profile
  async getStudentProfile(userId: number): Promise<StudentProfileDto> {
    const student = await this.studentRepo.findOne({
      where: { userId },
      relations: ['user', 'mentor', 'user.campus'],
    });

    if (!student) throw new NotFoundException('Student profile not found');

    return plainToInstance(StudentProfileDto, student, {
      excludeExtraneousValues: true,
    });
  }

  // UPDATE
  async update(
    id: number,
    dto: UpdateStudentDto,
  ): Promise<{ success: boolean }> {
    const student = await this.findOne(id);

    // --- Update related User ---
    if (dto.user) {
      await this.userService.update(student.user.id, dto.user);
    }

    // Update mentor
    if (dto.mentorId) {
      const mentor = await this.staffService.findOne(dto.mentorId);
      if (!mentor) throw new NotFoundException('Mentor not found');
      student.mentor = mentor;
    }

    // Update class
    if (dto.classId) {
      const existingClass = await this.classRepo.findOne({
        where: { id: dto.classId },
      });
      if (!existingClass) throw new NotFoundException('Class not found');
      student.class = existingClass;
    }

    // Update studentCode
    if (dto.studentCode) {
      const existingStudent = await this.studentRepo.findOne({
        where: { studentCode: dto.studentCode },
      });
      if (existingStudent && existingStudent.id !== id) {
        throw new BadRequestException('Student code already exists');
      }
      student.studentCode = dto.studentCode;
    }

    const updateFields: (keyof Omit<UpdateStudentDto, 'user'>)[] = [
      'faculty',
      'year',
      'term',
      'status',
    ];

    const updates: Partial<
      Record<keyof UpdateStudentDto, string | number | null>
    > = {};

    updateFields.forEach((key) => {
      const value = dto[key];
      if (value !== undefined) {
        updates[key] = value ?? null;
      }
    });

    Object.assign(student, updates);

    if (dto.enrolmentDay !== undefined) {
      student.enrolmentDay = new Date(dto.enrolmentDay);
    }

    await this.studentRepo.save(student);
    return { success: true };
  }

  // DELETE (soft: set user status = INACTIVE)
  async updateStudentStatus(
    studentId: number,
    status: UserStatus,
  ): Promise<{ success: true }> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (!student.user || !student.user.id) {
      throw new NotFoundException(
        `Related user not found for student ${studentId}`,
      );
    }

    // Call userService to update the user status
    await this.userService.updateStatus(student.user.id, status);
    await this.studentRepo.save(student);
    return { success: true };
  }
}
