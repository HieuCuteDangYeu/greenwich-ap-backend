import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Class } from '../class/entities/class.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffService } from '../staff/staff.service';
import { UserStatus } from '../user/dto/update-user-status.dto';
import { UserService } from '../user/user.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

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
    const studentCode = dto.studentCode ?? this.generateRandomStudentCode();
    const existing = await this.studentRepo.findOne({ where: { studentCode } });
    if (existing) throw new BadRequestException('Student code already exists');

    // Check mentor
    let mentor: Staff | null = null;
    if (dto.mentorId) {
      mentor = await this.staffService.findOne(dto.mentorId);
    }

    // Create new user
    const user = await this.userService.create({
      ...dto.user,
      roleId: (await this.userService.findRoleByName('Student')).id,
    });

    // Create new student (without classes)
    try {
      const student = this.studentRepo.create({
        ...dto,
        studentCode,
        user,
        mentor,
        classes: [], // Initialize empty classes array
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
      .leftJoinAndSelect('s.classes', 'classes');

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

  // UPDATE
  async update(
    id: number,
    dto: UpdateStudentDto,
  ): Promise<{ success: boolean }> {
    const student = await this.findOne(id);

    // Update mentor
    if (dto.mentorId) {
      const mentor = await this.staffService.findOne(dto.mentorId);
      if (!mentor) throw new NotFoundException('Mentor not found');
      student.mentor = mentor;
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

    const updateFields: (keyof Omit<UpdateStudentDto, 'user' | 'classId'>)[] = [
      'faculty',
      'currentYear',
      'startTerm',
      'endTerm',
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

  // Assign classes to student
  async assignClasses(studentId: number, classIds: number[]): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['classes'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Verify all classes exist
    const classes = await this.classRepo.findBy({ id: In(classIds) });
    if (classes.length !== classIds.length) {
      throw new NotFoundException('One or more classes not found');
    }

    // Get existing class IDs
    const existingClassIds = student.classes.map((c) => Number(c.id));

    // Add only new classes (avoid duplicates)
    const newClasses = classes.filter(
      (c) => !existingClassIds.includes(Number(c.id)),
    );

    student.classes = [...student.classes, ...newClasses];
    return await this.studentRepo.save(student);
  }

  // Remove a class from student
  async removeClass(studentId: number, classId: number): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['classes'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const classExists = student.classes.some((c) => Number(c.id) === classId);
    if (!classExists) {
      throw new NotFoundException(
        `Class with ID ${classId} is not assigned to this student`,
      );
    }

    student.classes = student.classes.filter((c) => Number(c.id) !== classId);
    return await this.studentRepo.save(student);
  }

  // Get all classes for a student
  async getStudentClasses(studentId: number): Promise<Class[]> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['classes'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return student.classes;
  }

  // Temporary
  private generateRandomStudentCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FGW${result}`;
  }
}
