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
import { Student } from '../student/entities/student.entity';
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
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
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

    const newSession = this.classSessionRepository.create({
      class: classEntity,
      course,
      courseId: course.id,
      classId: classEntity.id,
      dateOn: createSessionDto.dateOn,
      room,
      roomId: room.id,
      teacherId: createSessionDto.teacherId,
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
    { from, to }: { from?: string; to?: string } = {},
  ) {
    const where: Record<string, any> = { class: { id: classId } };

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
      session.teacherId = updateDto.teacherId;
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
    const classEntity = await this.findOne(id);

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

    return this.classCourseRepository.save(newClassCourse);
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
}
