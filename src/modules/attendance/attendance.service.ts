import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../student/entities/student.entity';
import { ClassSession } from '../class/entities/class-session.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  StudentScheduleResponseDto,
  StudentScheduleItemDto,
} from './dto/student-schedule-response.dto';

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
  async findAll(filter?: {
    studentId?: number;
    sessionId?: number;
    status?: string;
    classId?: number;
  }): Promise<Attendance[]> {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .leftJoinAndSelect('a.session', 'session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.room', 'room')
      .orderBy('a.createdAt', 'DESC');

    if (filter?.studentId) {
      qb.andWhere('a.studentId = :studentId', { studentId: filter.studentId });
    }

    if (filter?.sessionId) {
      qb.andWhere('a.sessionId = :sessionId', { sessionId: filter.sessionId });
    }

    if (filter?.status) {
      qb.andWhere('a.status = :status', { status: filter.status });
    }

    if (filter?.classId) {
      qb.andWhere('session.class_id = :classId', { classId: filter.classId });
    }

    return qb.getMany();
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

  // Additional helper methods

  // Get attendance statistics for a student
  async getStudentStats(studentId: number): Promise<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  }> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const attendances = await this.attendanceRepo.find({
      where: { studentId },
    });

    const total = attendances.length;
    const present = attendances.filter((a) => a.status === 'PRESENT').length;
    const absent = attendances.filter((a) => a.status === 'ABSENT').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;
    const excused = attendances.filter((a) => a.status === 'EXCUSED').length;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
    };
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

    // Verify student exists and get their class (optimized: only fetch needed fields)
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      select: ['id', 'classId'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!student.classId) {
      throw new BadRequestException('Student is not assigned to any class');
    }

    // Optimized: Get sessions and attendance separately but efficiently
    // First get all sessions
    const sessions = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.room', 'room')
      .leftJoinAndSelect('session.timeSlots', 'timeSlots')
      .where('session.class_id = :classId', { classId: student.classId })
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
      .where('attendance.studentId = :studentId', { studentId })
      .andWhere('attendance.sessionId IN (:...sessionIds)', { sessionIds })
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
