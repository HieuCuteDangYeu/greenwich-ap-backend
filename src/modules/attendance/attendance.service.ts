import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { Student } from '../student/entities/student.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateBulkAttendanceDto } from './dto/create-bulk-attendance.dto';
import {
  StudentScheduleItemDto,
  StudentScheduleResponseDto,
} from './dto/student-schedule-response.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UpdateBulkAttendanceDto } from './dto/update-bulk-attendance.dto';
import { Attendance } from './entities/attendance.entity';

interface FindAllOptions {
  studentId?: number;
  sessionId?: number;
  status?: string;
  classId?: number;
  courseId?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(ClassSession)
    private readonly sessionRepo: Repository<ClassSession>,
  ) {}

  // CREATE
  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    // Verify student exists
    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify session exists
    const session = await this.sessionRepo.findOne({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Class session not found');
    }

    // Check for duplicate attendance record
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        studentId: dto.studentId,
        sessionId: dto.sessionId,
      },
    });
    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance record already exists for this student in this session',
      );
    }

    const attendance = this.attendanceRepo.create({
      ...dto,
      student,
      session,
    });

    return this.attendanceRepo.save(attendance);
  }

  // READ all with filters
  async findAll(filter: FindAllOptions = {}): Promise<Attendance[]> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 25;
    const skip = (page - 1) * limit;

    const where: {
      student?: { id: number };
      session?: {
        id?: number;
        class?: { id: number };
        course?: { id: number };
      };
      status?: 'PRESENT' | 'ABSENT' | 'PENDING';
    } = {};

    if (filter.studentId) {
      where.student = { id: filter.studentId };
    }

    if (filter.sessionId) {
      where.session = { id: filter.sessionId };
    }

    if (filter.status) {
      where.status = filter.status as 'PRESENT' | 'ABSENT' | 'PENDING';
    }

    if (filter.classId) {
      where.session = {
        ...(where.session || {}),
        class: { id: filter.classId },
      };
    }

    if (filter.courseId) {
      where.session = {
        ...(where.session || {}),
        course: { id: filter.courseId },
      };
    }

    type OrderType =
      | { id: 'ASC' | 'DESC' }
      | { createdAt: 'ASC' | 'DESC' }
      | { session: { dateOn: 'ASC' | 'DESC' } };

    const orderValue = filter.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sortFieldMap: Record<string, OrderType> = {
      id: { id: orderValue },
      createdAt: { createdAt: orderValue },
      dateOn: { session: { dateOn: orderValue } },
    };

    const order: OrderType = sortFieldMap[filter.sort || 'id'] || {
      id: orderValue,
    };

    const records = await this.attendanceRepo.find({
      where,
      relations: [
        'student',
        'student.user',
        'session',
        'session.class',
        'session.course',
        'session.room',
      ],
      order,
      skip,
      take: limit,
    });

    return records;
  }

  // READ one
  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: [
        'student',
        'session',
        'session.class',
        'session.course',
        'session.room',
      ],
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  // UPDATE
  async update(id: number, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);

    if (dto.studentId !== undefined && dto.studentId !== attendance.studentId) {
      const student = await this.studentRepo.findOne({
        where: { id: dto.studentId },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      attendance.student = student;
      attendance.studentId = dto.studentId;
    }

    if (dto.sessionId !== undefined && dto.sessionId !== attendance.sessionId) {
      const session = await this.sessionRepo.findOne({
        where: { id: dto.sessionId },
      });
      if (!session) {
        throw new NotFoundException('Class session not found');
      }
      attendance.session = session;
      attendance.sessionId = dto.sessionId;
    }

    // Check for duplicate if student or session changed
    if (dto.studentId !== undefined || dto.sessionId !== undefined) {
      const existingAttendance = await this.attendanceRepo.findOne({
        where: {
          studentId: attendance.studentId,
          sessionId: attendance.sessionId,
        },
      });
      if (existingAttendance && existingAttendance.id !== id) {
        throw new BadRequestException(
          'Attendance record already exists for this student in this session',
        );
      }
    }

    if (dto.status !== undefined) {
      attendance.status = dto.status;
    }

    if (dto.note !== undefined) {
      attendance.note = dto.note;
    }

    return this.attendanceRepo.save(attendance);
  }

  // DELETE
  async remove(id: number): Promise<{ deleted: boolean }> {
    const attendance = await this.findOne(id);
    await this.attendanceRepo.remove(attendance);
    return { deleted: true };
  }

  // DELETE all attendance records for a session
  async removeBySession(sessionId: number): Promise<{ deleted: number }> {
    const result = await this.attendanceRepo.delete({ sessionId });
    return { deleted: result.affected || 0 };
  }

  // BULK CREATE - Create attendance for multiple students in one session
  async createBulk(dto: CreateBulkAttendanceDto): Promise<{
    created: Attendance[];
    errors: Array<{ studentId: number; error: string }>;
  }> {
    // Verify session exists
    const session = await this.sessionRepo.findOne({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Class session not found');
    }

    const created: Attendance[] = [];
    const errors: Array<{ studentId: number; error: string }> = [];

    // Get all student IDs to verify they exist
    const studentIds = dto.students.map((s) => s.studentId);
    const students = await this.studentRepo
      .createQueryBuilder('student')
      .where('student.id IN (:...studentIds)', { studentIds })
      .getMany();

    // Convert bigint IDs to numbers for comparison
    const studentMap = new Map(students.map((s) => [Number(s.id), s]));

    // Get existing attendance records for this session
    const existingAttendances = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.session_id = :sessionId', {
        sessionId: dto.sessionId,
      })
      .andWhere('attendance.student_id IN (:...studentIds)', { studentIds })
      .getMany();

    const existingAttendanceMap = new Map(
      existingAttendances.map((a) => [Number(a.studentId), true]),
    );

    // Process each student
    for (const studentData of dto.students) {
      const student = studentMap.get(studentData.studentId);

      if (!student) {
        errors.push({
          studentId: studentData.studentId,
          error: 'Student not found',
        });
        continue;
      }

      if (existingAttendanceMap.has(studentData.studentId)) {
        errors.push({
          studentId: studentData.studentId,
          error:
            'Attendance record already exists for this student in this session',
        });
        continue;
      }

      const attendance = this.attendanceRepo.create({
        studentId: studentData.studentId,
        sessionId: dto.sessionId,
        status: studentData.status,
        note: studentData.note,
        student,
        session,
      });

      created.push(attendance);
    }

    // Save all valid attendance records
    if (created.length > 0) {
      await this.attendanceRepo.save(created);
    }

    // If no records were created and there are errors, throw an exception
    if (created.length === 0 && errors.length > 0) {
      throw new BadRequestException({
        message: 'Failed to create any attendance records',
        errors,
      });
    }

    return { created, errors };
  }

  // BULK UPDATE - Update attendance for multiple students in one session
  async updateBulk(dto: UpdateBulkAttendanceDto): Promise<{
    updated: Attendance[];
    errors: Array<{ studentId: number; error: string }>;
  }> {
    // Verify session exists
    const session = await this.sessionRepo.findOne({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Class session not found');
    }

    const updated: Attendance[] = [];
    const errors: Array<{ studentId: number; error: string }> = [];

    // Get all student IDs
    const studentIds = dto.students.map((s) => s.studentId);

    // Get existing attendance records for this session and these students
    const existingAttendances = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.session', 'session')
      .where('attendance.session_id = :sessionId', {
        sessionId: dto.sessionId,
      })
      .andWhere('attendance.student_id IN (:...studentIds)', { studentIds })
      .getMany();

    const attendanceMap = new Map(
      existingAttendances.map((a) => [Number(a.studentId), a]),
    );

    // Process each student update
    for (const studentData of dto.students) {
      const attendance = attendanceMap.get(studentData.studentId);

      if (!attendance) {
        errors.push({
          studentId: studentData.studentId,
          error: 'Attendance record not found for this student in this session',
        });
        continue;
      }

      // Update fields if provided
      if (studentData.status !== undefined) {
        attendance.status = studentData.status;
      }

      if (studentData.note !== undefined) {
        attendance.note = studentData.note;
      }

      updated.push(attendance);
    }

    // Save all updated attendance records
    if (updated.length > 0) {
      await this.attendanceRepo.save(updated);
    }

    // If no records were updated and there are errors, throw an exception
    if (updated.length === 0 && errors.length > 0) {
      throw new BadRequestException({
        message: 'Failed to update any attendance records',
        errors,
      });
    }

    return { updated, errors };
  }

  // Additional helper methods

  // Get attendance statistics for students
  async getStudentStats(
    studentId?: number,
    courseId?: number,
    classId?: number,
  ): Promise<
    | {
        total: number;
        present: number;
        absent: number;
        pending: number;
        attendanceRate: number;
      }
    | Array<{
        studentId: number;
        studentCode: string;
        studentName: string;
        total: number;
        present: number;
        absent: number;
        pending: number;
        attendanceRate: number;
      }>
  > {
    // If studentId is provided, return stats for that student only
    if (studentId) {
      const student = await this.studentRepo.findOne({
        where: { id: studentId },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const queryBuilder = this.attendanceRepo
        .createQueryBuilder('attendance')
        .leftJoinAndSelect('attendance.session', 'session')
        .where('attendance.student_id = :studentId', { studentId });

      if (courseId) {
        queryBuilder.andWhere('session.course_id = :courseId', { courseId });
      }

      const attendances = await queryBuilder.getMany();

      const total = attendances.length;
      const present = attendances.filter((a) => a.status === 'PRESENT').length;
      const absent = attendances.filter((a) => a.status === 'ABSENT').length;
      const pending = attendances.filter((a) => a.status === 'PENDING').length;
      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        total,
        present,
        absent,
        pending,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      };
    }

    // Otherwise return stats for all students with optional filters
    const studentQuery = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user');

    if (classId) {
      studentQuery
        .innerJoin('student.classes', 'class')
        .andWhere('class.id = :classId', { classId });
    }

    const students = await studentQuery.getMany();

    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map((s) => Number(s.id));

    // Get all attendances for these students
    const attendanceQuery = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.session', 'session')
      .where('attendance.student_id IN (:...studentIds)', { studentIds });

    if (courseId) {
      attendanceQuery.andWhere('session.course_id = :courseId', { courseId });
    }

    const attendances = await attendanceQuery.getMany();

    // Group attendances by studentId
    const attendancesByStudent = new Map<number, typeof attendances>();
    attendances.forEach((att) => {
      const studentId = Number(att.studentId);
      if (!attendancesByStudent.has(studentId)) {
        attendancesByStudent.set(studentId, []);
      }
      attendancesByStudent.get(studentId)!.push(att);
    });

    // Calculate stats for each student
    return students.map((student) => {
      const studentAttendances =
        attendancesByStudent.get(Number(student.id)) || [];
      const total = studentAttendances.length;
      const present = studentAttendances.filter(
        (a) => a.status === 'PRESENT',
      ).length;
      const absent = studentAttendances.filter(
        (a) => a.status === 'ABSENT',
      ).length;
      const pending = studentAttendances.filter(
        (a) => a.status === 'PENDING',
      ).length;
      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return {
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.user?.fullName || '',
        total,
        present,
        absent,
        pending,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      };
    });
  }

  // Get student schedule with attendance for a date range
  async getStudentSchedule(
    studentId: number,
    startDate: string,
    endDate: string,
  ): Promise<StudentScheduleResponseDto> {
    // Validate date range is within 7 days first (fail fast)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      throw new BadRequestException(
        'Date range must not exceed 7 days. Please select a shorter date range.',
      );
    }

    if (start > end) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    // Verify student exists and get their classes
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['classes'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!student.classes || student.classes.length === 0) {
      throw new BadRequestException('Student is not assigned to any class');
    }

    // Get all class IDs for the student
    const classIds = student.classes.map((c) => Number(c.id));

    // Optimized: Get sessions and attendance separately but efficiently
    // First get all sessions for all of the student's classes
    const sessions = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.room', 'room')
      .leftJoinAndSelect('session.timeSlots', 'timeSlots')
      .where('session.class_id IN (:...classIds)', { classIds })
      .andWhere('session.date_on >= :startDate', { startDate })
      .andWhere('session.date_on <= :endDate', { endDate })
      .orderBy('session.date_on', 'ASC')
      .addOrderBy('timeSlots.start_time', 'ASC')
      .getMany();

    // Early return if no sessions found
    if (sessions.length === 0) {
      return {
        studentId,
        startDate,
        endDate,
        schedule: [],
      };
    }

    // Get attendance records for these specific sessions
    const sessionIds = sessions.map((s) => s.id);
    const attendances = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .select(['attendance.sessionId', 'attendance.status'])
      .where('attendance.student_id = :studentId', { studentId })
      .andWhere('attendance.session_id IN (:...sessionIds)', { sessionIds })
      .getMany();

    // Create a map of session ID to attendance status
    const attendanceMap = new Map<number, string>();
    attendances.forEach((att) => {
      attendanceMap.set(att.sessionId, att.status);
    });

    // Build the schedule items
    const schedule: StudentScheduleItemDto[] = [];

    for (const session of sessions) {
      // Skip sessions without required data (shouldn't happen, but safety check)
      if (!session.class || !session.course || !session.room) {
        continue;
      }

      // Get the day of week (0-6, 0 = Sunday)
      const sessionDate = new Date(session.dateOn);
      const dayOfWeek = sessionDate.getDay();

      // Get attendance status or mark as NOT_RECORDED
      const status = attendanceMap.get(session.id) || 'NOT_RECORDED';

      // Handle multiple time slots for a session
      if (session.timeSlots && session.timeSlots.length > 0) {
        // Sort time slots by start time for consistent ordering
        const sortedSlots = [...session.timeSlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        );

        for (const timeSlot of sortedSlots) {
          schedule.push({
            class: session.class.name,
            course: session.course.code,
            room: session.room.code,
            teacher: session.teacherId,
            status: status,
            day: dayOfWeek,
            slot: timeSlot.id,
            date: session.dateOn,
            sessionId: session.id,
            classId: session.classId,
            courseId: session.courseId,
            roomId: session.roomId,
            slotName: timeSlot.name,
            slotStartTime: timeSlot.startTime,
            slotEndTime: timeSlot.endTime,
          });
        }
      } else {
        // If no time slots, still create an entry
        schedule.push({
          class: session.class.name,
          course: session.course.code,
          room: session.room.code,
          teacher: session.teacherId,
          status: status,
          day: dayOfWeek,
          slot: 0, // No slot assigned
          date: session.dateOn,
          sessionId: session.id,
          classId: session.classId,
          courseId: session.courseId,
          roomId: session.roomId,
          slotName: 'Not Assigned',
          slotStartTime: '00:00:00',
          slotEndTime: '00:00:00',
        });
      }
    }

    return {
      studentId,
      startDate,
      endDate,
      schedule,
    };
  }
}
