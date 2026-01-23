import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AttendanceService } from '../attendance/attendance.service';
import { Course } from '../course/entities/course.entity';
import { Room } from '../room/entities/room.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../student/entities/student.entity';
import { Term } from '../term/entities/term.entity';
import { AddCourseDto } from './dto/add-course.dto';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { Class } from './entities/class.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassCourse)
    private readonly classCourseRepository: Repository<ClassCourse>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Term)
    private readonly termRepo: Repository<Term>,
    private readonly attendanceService: AttendanceService,
  ) {}

  create(createClassDto: CreateClassDto) {
    const newClass = this.classRepository.create(createClassDto);
    return this.classRepository.save(newClass);
  }

  async createSession(
    classId: number,
    createSessionDto: CreateClassSessionDto,
  ) {
    const classEntity = await this.findOne(classId);

    const course = await this.courseRepository.findOne({
      where: { id: createSessionDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createSessionDto.courseId} not found`,
      );
    }

    const classCourse = await this.classCourseRepository.findOne({
      where: { class: { id: classEntity.id }, course: { id: course.id } },
    });

    if (!classCourse) {
      throw new BadRequestException(
        `Course with ID ${course.id} is not assigned to class with ID ${classEntity.id}`,
      );
    }

    const room = await this.roomRepository.findOne({
      where: { id: createSessionDto.roomId },
    });

    if (!room) {
      throw new NotFoundException(
        `Room with ID ${createSessionDto.roomId} not found`,
      );
    }

    const teacher = await this.staffRepository.findOne({
      where: { id: createSessionDto.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with ID ${createSessionDto.teacherId} not found`,
      );
    }

    const newSession = this.classSessionRepository.create({
      class: classEntity,
      course,
      courseId: course.id,
      classId: classEntity.id,
      dateOn: createSessionDto.dateOn,
      room,
      roomId: room.id,
      teacher,
      teacherId: teacher.id,
      status: createSessionDto.status ?? 'SCHEDULED',
    });

    const savedSession = await this.classSessionRepository.save(newSession);

    // Get all students in this class
    const students = await this.findStudentsByClass(classId);

    // Create attendance records for all students
    if (students.length > 0) {
      const studentIds = students.map((student) => Number(student.id));

      await this.attendanceService.createBulk({
        sessionId: savedSession.id,
        students: studentIds.map((studentId) => ({
          studentId,
          status: 'PENDING',
        })),
      });
    }

    return savedSession;
  }

  findSessions(
    classId: number,
    {
      from,
      to,
      courseId,
    }: { from?: string; to?: string; courseId?: number } = {},
  ) {
    const where: Record<string, any> = { class: { id: classId } };
    if (courseId !== undefined) {
      where.course = { id: courseId };
    }
    if (from && to) {
      if (new Date(from) > new Date(to)) {
        throw new BadRequestException(
          'The "from" date must be earlier than or equal to the "to" date.',
        );
      }
      where.dateOn = Between(from, to);
    } else if (from) {
      where.dateOn = MoreThanOrEqual(from);
    } else if (to) {
      where.dateOn = LessThanOrEqual(to);
    }

    return this.classSessionRepository.find({
      where,
      relations: ['course', 'room'],
      order: { dateOn: 'ASC' },
    });
  }

  async findSession(classId: number, sessionId: number) {
    const session = await this.classSessionRepository.findOne({
      where: { id: sessionId, class: { id: classId } },
      relations: ['course', 'class', 'room'],
    });

    if (!session) {
      throw new NotFoundException(
        `Session with ID ${sessionId} not found for class ${classId}`,
      );
    }

    return session;
  }

  async updateSession(
    classId: number,
    sessionId: number,
    updateDto: UpdateClassSessionDto,
  ) {
    const session = await this.findSession(classId, sessionId);

    if (updateDto.courseId !== undefined) {
      const course = await this.courseRepository.findOne({
        where: { id: updateDto.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          `Course with ID ${updateDto.courseId} not found`,
        );
      }

      const classCourse = await this.classCourseRepository.findOne({
        where: { class: { id: classId }, course: { id: course.id } },
      });
      if (!classCourse) {
        throw new BadRequestException(
          `Course with ID ${course.id} is not assigned to class with ID ${classId}`,
        );
      }

      session.course = course;
    }

    if (updateDto.dateOn !== undefined) {
      session.dateOn = updateDto.dateOn;
    }
    if (updateDto.roomId !== undefined) {
      const room = await this.roomRepository.findOne({
        where: { id: updateDto.roomId },
      });
      if (!room) {
        throw new NotFoundException(
          `Room with ID ${updateDto.roomId} not found`,
        );
      }

      session.room = room;
      session.roomId = room.id;
    }
    if (updateDto.teacherId !== undefined) {
      const teacher = await this.staffRepository.findOne({
        where: { id: updateDto.teacherId },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID ${updateDto.teacherId} not found`,
        );
      }

      session.teacher = teacher;
      session.teacherId = teacher.id;
    }
    if (updateDto.status !== undefined) {
      session.status = updateDto.status;
    }

    return this.classSessionRepository.save(session);
  }

  async removeSession(classId: number, sessionId: number) {
    const session = await this.findSession(classId, sessionId);

    // Delete all attendance records for this session
    await this.attendanceService.removeBySession(sessionId);

    // Delete the session
    await this.classSessionRepository.remove(session);
    return { deleted: true };
  }

  async findAll(opts?: {
    programmeId?: number;
    termId?: number;
    departmentId?: number;
  }): Promise<Class[]> {
    const qb = this.classRepository.createQueryBuilder('class');

    // Apply filters if any are provided
    if (opts?.programmeId || opts?.termId || opts?.departmentId) {
      qb.innerJoin('class.classCourses', 'cc')
        .innerJoin('cc.course', 'course')
        .innerJoin('course.department', 'department');

      if (opts.departmentId) {
        qb.andWhere('department.id = :departmentId', {
          departmentId: opts.departmentId,
        });
      }

      if (opts.programmeId || opts.termId) {
        qb.innerJoin(
          'term_department',
          'td',
          'td.department_id = department.id',
        ).innerJoin('term', 'term', 'term.id = td.term_id');

        if (opts.programmeId) {
          qb.andWhere('term.programme_id = :programmeId', {
            programmeId: opts.programmeId,
          });
        }

        if (opts.termId) {
          qb.andWhere('term.id = :termId', {
            termId: opts.termId,
          });
        }
      }

      qb.groupBy('class.id');
    }

    return qb.getMany();
  }

  async findOne(id: number, relations: string[] = []) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations,
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    await this.classRepository.update(id, updateClassDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.classRepository.delete(id);
  }

  async addCourse(id: number, addCourseDto: AddCourseDto) {
    const classEntity = await this.findOne(id, ['students']);

    const course = await this.courseRepository.findOneBy({
      id: addCourseDto.courseId,
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${addCourseDto.courseId} not found`,
      );
    }

    const newClassCourse = this.classCourseRepository.create({
      class: classEntity,
      course: course,
      note: addCourseDto.note,
    });

    const saved = await this.classCourseRepository.save(newClassCourse);
    await this.updateStudentAcademicFields(classEntity.students || []);
    return saved;
  }

  async removeCourse(id: number, courseId: number) {
    const classCourse = await this.classCourseRepository.findOne({
      where: { class: { id }, course: { id: courseId } },
    });

    if (!classCourse) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in class with ID ${id}`,
      );
    }

    return this.classCourseRepository.remove(classCourse);
  }

  async findStudentsByClass(id: number) {
    const classEntity = await this.findOne(id, ['students']);
    return classEntity.students || [];
  }

  async findCoursesByClass(id: number) {
    const classCourses = await this.classCourseRepository.find({
      where: { class: { id } },
      relations: ['course'],
    });
    return classCourses.map((cc) => cc.course);
  }

  private calculateCurrentYear(enrolmentDay: Date, now = new Date()): string {
    const enrol = new Date(enrolmentDay);
    let years = now.getFullYear() - enrol.getFullYear();
    const anniversaryPassed =
      now.getMonth() > enrol.getMonth() ||
      (now.getMonth() === enrol.getMonth() && now.getDate() >= enrol.getDate());

    if (!anniversaryPassed) {
      years -= 1;
    }

    const academicYear = Math.min(Math.max(years + 1, 1), 4);
    return academicYear.toString();
  }

  private parseTermName(termName: string): { term: string; year: number } {
    const match = termName.trim().match(/^(Spring|Summer|Fall)\s+(\d{4})$/i);
    if (!match) {
      throw new BadRequestException(
        'Invalid term name format. Expected "Spring 2025".',
      );
    }

    const term =
      match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const year = Number(match[2]);
    return { term, year };
  }

  private calculateEndTerm(startTerm: string): string {
    const { term, year } = this.parseTermName(startTerm);
    const terms = ['Spring', 'Summer', 'Fall'];
    const startIndex = terms.indexOf(term);
    const offset = 11;
    const endIndex = startIndex + offset;
    const yearOffset = Math.floor(endIndex / terms.length);
    const termIndex = endIndex % terms.length;

    return `${terms[termIndex]} ${year + yearOffset}`;
  }

  private async getCurrentTermName(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const term = await this.termRepo
      .createQueryBuilder('term')
      .where('term.start_date IS NOT NULL')
      .andWhere('term.end_date IS NOT NULL')
      .andWhere('term.start_date <= :today', { today })
      .andWhere('term.end_date >= :today', { today })
      .orderBy('term.start_date', 'DESC')
      .getOne();

    if (!term) {
      throw new BadRequestException(
        'No active term found for the current date.',
      );
    }

    return term.name;
  }

  private async updateStudentAcademicFields(students: Student[]) {
    if (students.length === 0) {
      return;
    }

    const now = new Date();
    const needsStartTerm = students.some((student) => !student.startTerm);
    const currentTermName = needsStartTerm
      ? await this.getCurrentTermName()
      : null;

    students.forEach((student) => {
      student.currentYear = this.calculateCurrentYear(
        student.enrolmentDay,
        now,
      );

      const startTerm = student.startTerm ?? currentTermName ?? undefined;
      if (!student.startTerm && currentTermName) {
        student.startTerm = currentTermName;
      }

      if (!student.endTerm && startTerm) {
        student.endTerm = this.calculateEndTerm(startTerm);
      }
    });

    await this.studentRepo.save(students);
  }
}
