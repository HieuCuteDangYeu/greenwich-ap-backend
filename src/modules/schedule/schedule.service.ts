import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomBooking } from '../room-booking/entities/room-booking.entity';
import { ScheduleItemDto } from './dto/schedule-item.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(RoomBooking)
    private readonly roomBookingRepository: Repository<RoomBooking>,
  ) {}

  async getSchedule({
    from,
    to,
    roomId,
    timeSlotId,
    classId,
    courseId,
    teacherId,
    requesterUserId,
  }: {
    from?: string;
    to?: string;
    roomId?: number;
    timeSlotId?: number;
    classId?: number;
    courseId?: number;
    teacherId?: number;
    requesterUserId?: number;
  }): Promise<ScheduleItemDto[]> {
    if (!from || !to) {
      throw new BadRequestException('Both "from" and "to" dates are required.');
    }

    if (new Date(from) > new Date(to)) {
      throw new BadRequestException(
        'The "from" date must be earlier than or equal to the "to" date.',
      );
    }

    const sessionQuery = this.classSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.room', 'room')
      .leftJoinAndSelect('session.teacher', 'teacher')
      .leftJoinAndSelect('session.timeSlot', 'timeSlot')
      .where('session.date_on >= :from', { from })
      .andWhere('session.date_on <= :to', { to })
      .andWhere('session.status != :cancelled', { cancelled: 'CANCELLED' });

    if (roomId) {
      sessionQuery.andWhere('session.room_id = :roomId', { roomId });
    }
    if (timeSlotId) {
      sessionQuery.andWhere('session.time_slot_id = :timeSlotId', {
        timeSlotId,
      });
    }
    if (classId) {
      sessionQuery.andWhere('session.class_id = :classId', { classId });
    }
    if (courseId) {
      sessionQuery.andWhere('session.course_id = :courseId', { courseId });
    }
    if (teacherId) {
      sessionQuery.andWhere('session.teacher_id = :teacherId', { teacherId });
    }

    const sessions = await sessionQuery.getMany();

    const bookingQuery = this.roomBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')
      .leftJoinAndSelect('booking.requesterUser', 'requesterUser')
      .leftJoinAndSelect('booking.slots', 'slots')
      .leftJoinAndSelect('slots.timeSlot', 'timeSlot')
      .where('booking.status = :status', { status: 'APPROVED' })
      .andWhere('booking.date_on >= :from', { from })
      .andWhere('booking.date_on <= :to', { to });

    if (roomId) {
      bookingQuery.andWhere('booking.room_id = :roomId', { roomId });
    }
    if (requesterUserId) {
      bookingQuery.andWhere('booking.requester_user_id = :requesterUserId', {
        requesterUserId,
      });
    }
    if (timeSlotId) {
      bookingQuery.andWhere('slots.time_slot_id = :timeSlotId', { timeSlotId });
    }

    const bookings = await bookingQuery.getMany();

    const items: ScheduleItemDto[] = [
      ...sessions
        .filter((session) => session.timeSlotId)
        .map((session) => ({
          type: 'CLASS_SESSION' as const,
          dateOn: session.dateOn,
          roomId: session.roomId,
          timeSlotId: session.timeSlotId!,
          classId: session.classId,
          courseId: session.courseId,
          teacherId: session.teacherId,
          sessionId: session.id,
        })),
      ...bookings.flatMap((booking) =>
        booking.slots.map((slot) => ({
          type: 'ROOM_BOOKING' as const,
          dateOn: booking.dateOn,
          roomId: booking.roomId,
          timeSlotId: slot.timeSlotId,
          bookingId: booking.id,
          requesterUserId: booking.requesterUserId,
        })),
      ),
    ];

    return items.sort((a, b) => {
      if (a.dateOn === b.dateOn) {
        return a.timeSlotId - b.timeSlotId;
      }
      return a.dateOn.localeCompare(b.dateOn);
    });
  }
}
