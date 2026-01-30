import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomBookingSlot } from '../room-booking/entities/room-booking-slot.entity';
import { BookingStatus } from '../room-booking/entities/room-booking.entity';

export type RoomConflictSource = 'CLASS_SESSION' | 'ROOM_BOOKING';

export interface RoomConflictResult {
  conflictingTimeSlotIds: number[];
  conflicts: Array<{
    source: RoomConflictSource;
    timeSlotId: number;
    sessionId?: number;
    bookingId?: number;
  }>;
}

@Injectable()
export class RoomConflictService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(RoomBookingSlot)
    private readonly roomBookingSlotRepository: Repository<RoomBookingSlot>,
  ) {}

  async checkRoomConflict({
    roomId,
    dateOn,
    timeSlotIds,
    excludeSessionId,
    excludeBookingId,
    bookingStatuses = ['APPROVED'],
  }: {
    roomId: number;
    dateOn: string;
    timeSlotIds: number[];
    excludeSessionId?: number;
    excludeBookingId?: number;
    bookingStatuses?: BookingStatus[];
  }): Promise<RoomConflictResult> {
    if (timeSlotIds.length === 0) {
      return { conflictingTimeSlotIds: [], conflicts: [] };
    }

    const sessionQuery = this.classSessionRepository
      .createQueryBuilder('session')
      .select(['session.id AS sessionId', 'session.time_slot_id AS timeSlotId'])
      .where('session.room_id = :roomId', { roomId })
      .andWhere('session.date_on = :dateOn', { dateOn })
      .andWhere('session.time_slot_id IN (:...timeSlotIds)', { timeSlotIds })
      .andWhere('session.status != :cancelled', { cancelled: 'CANCELLED' });

    if (excludeSessionId) {
      sessionQuery.andWhere('session.id != :excludeSessionId', {
        excludeSessionId,
      });
    }

    const sessionConflicts = await sessionQuery.getRawMany<{
      sessionId: number;
      timeSlotId: number;
    }>();

    const bookingQuery = this.roomBookingSlotRepository
      .createQueryBuilder('slot')
      .innerJoin('slot.booking', 'booking')
      .select([
        'slot.time_slot_id AS timeSlotId',
        'slot.booking_id AS bookingId',
      ])
      .where('slot.room_id = :roomId', { roomId })
      .andWhere('slot.date_on = :dateOn', { dateOn })
      .andWhere('slot.time_slot_id IN (:...timeSlotIds)', { timeSlotIds })
      .andWhere('booking.status IN (:...bookingStatuses)', {
        bookingStatuses,
      });

    if (excludeBookingId) {
      bookingQuery.andWhere('slot.booking_id != :excludeBookingId', {
        excludeBookingId,
      });
    }

    const bookingConflicts = await bookingQuery.getRawMany<{
      timeSlotId: number;
      bookingId: number;
    }>();

    const conflicts: RoomConflictResult['conflicts'] = [
      ...sessionConflicts.map((conflict) => ({
        source: 'CLASS_SESSION' as const,
        timeSlotId: Number(conflict.timeSlotId),
        sessionId: Number(conflict.sessionId),
      })),
      ...bookingConflicts.map((conflict) => ({
        source: 'ROOM_BOOKING' as const,
        timeSlotId: Number(conflict.timeSlotId),
        bookingId: Number(conflict.bookingId),
      })),
    ];

    const conflictingTimeSlotIds = Array.from(
      new Set(conflicts.map((conflict) => conflict.timeSlotId)),
    );

    return { conflictingTimeSlotIds, conflicts };
  }
}
