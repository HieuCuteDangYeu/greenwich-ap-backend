import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomConflictService } from '../room-conflict/room-conflict.service';
import { Room } from '../room/entities/room.entity';
import { Staff } from '../staff/entities/staff.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { User } from '../user/entities/user.entity';
import { CreateRescheduleRequestDto } from './dto/create-reschedule-request.dto';
import { ReviewRescheduleRequestDto } from './dto/review-reschedule-request.dto';
import { RescheduleRequest } from './entities/reschedule-request.entity';

type AuthUser = User & { staff?: Staff; role?: { name?: string } };

@Injectable()
export class RescheduleRequestService {
  constructor(
    @InjectRepository(RescheduleRequest)
    private readonly rescheduleRequestRepository: Repository<RescheduleRequest>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly roomConflictService: RoomConflictService,
  ) {}

  async create(currentUser: AuthUser, dto: CreateRescheduleRequestDto) {
    const teacherId = currentUser.staff?.id;
    if (!teacherId) {
      throw new ForbiddenException('Teacher profile not found.');
    }

    const session = await this.classSessionRepository.findOne({
      where: { id: dto.sessionId },
      relations: ['teacher'],
    });
    if (!session) {
      throw new NotFoundException(
        `Class session with ID ${dto.sessionId} not found`,
      );
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You can only request reschedule for your own sessions.',
      );
    }

    this.ensureDateNotInPast(dto.newDateOn);

    const room = await this.roomRepository.findOne({
      where: { id: dto.newRoomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${dto.newRoomId} not found`);
    }

    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id: dto.newTimeSlotId },
    });
    if (!timeSlot) {
      throw new NotFoundException(
        `Time slot with ID ${dto.newTimeSlotId} not found`,
      );
    }

    const conflict = await this.roomConflictService.checkRoomConflict({
      roomId: dto.newRoomId,
      dateOn: dto.newDateOn,
      timeSlotIds: [dto.newTimeSlotId],
      bookingStatuses: ['PENDING', 'APPROVED'],
      excludeSessionId: session.id,
    });

    if (conflict.conflictingTimeSlotIds.length > 0) {
      throw new ConflictException({
        message: `The requested time ${dto.newDateOn} has conflicts on time slots: ${conflict.conflictingTimeSlotIds.join(
          ', ',
        )}. Please adjust before submitting.`,
        conflicts: conflict.conflictingTimeSlotIds,
      });
    }

    const request = this.rescheduleRequestRepository.create({
      session,
      sessionId: session.id,
      requestedByTeacherId: teacherId,
      requestedByTeacher: currentUser.staff,
      newDateOn: dto.newDateOn,
      newRoomId: room.id,
      newRoom: room,
      newTimeSlotId: timeSlot.id,
      newTimeSlot: timeSlot,
      reason: dto.reason ?? null,
      status: 'PENDING',
    });

    return this.rescheduleRequestRepository.save(request);
  }

  async findMyRequests(currentUser: AuthUser) {
    const teacherId = currentUser.staff?.id;
    if (!teacherId) {
      throw new ForbiddenException('Teacher profile not found.');
    }

    return this.rescheduleRequestRepository.find({
      where: { requestedByTeacherId: teacherId },
      relations: ['session', 'session.course', 'session.class', 'newRoom'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll({
    status,
    sessionId,
    requestedByTeacherId,
    from,
    to,
  }: {
    status?: string;
    sessionId?: number;
    requestedByTeacherId?: number;
    from?: string;
    to?: string;
  } = {}) {
    const qb = this.rescheduleRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.session', 'session')
      .leftJoinAndSelect('session.class', 'class')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('request.newRoom', 'newRoom')
      .leftJoinAndSelect('request.newTimeSlot', 'newTimeSlot')
      .leftJoinAndSelect('request.requestedByTeacher', 'requestedByTeacher');

    if (status) {
      qb.andWhere('request.status = :status', { status });
    }
    if (sessionId) {
      qb.andWhere('request.session_id = :sessionId', { sessionId });
    }
    if (requestedByTeacherId) {
      qb.andWhere('request.requested_by_teacher_id = :requestedByTeacherId', {
        requestedByTeacherId,
      });
    }
    if (from) {
      qb.andWhere('request.new_date_on >= :from', { from });
    }
    if (to) {
      qb.andWhere('request.new_date_on <= :to', { to });
    }

    return qb.orderBy('request.created_at', 'DESC').getMany();
  }

  async approve(
    id: number,
    currentUser: AuthUser,
    dto: ReviewRescheduleRequestDto,
  ) {
    return this.reviewRequest(id, currentUser, dto, 'APPROVED');
  }

  async reject(
    id: number,
    currentUser: AuthUser,
    dto: ReviewRescheduleRequestDto,
  ) {
    return this.reviewRequest(id, currentUser, dto, 'REJECTED');
  }

  private async reviewRequest(
    id: number,
    currentUser: AuthUser,
    dto: ReviewRescheduleRequestDto,
    nextStatus: 'APPROVED' | 'REJECTED',
  ) {
    const request = await this.rescheduleRequestRepository.findOne({
      where: { id },
      relations: ['session'],
    });

    if (!request) {
      throw new NotFoundException(`Reschedule request ${id} not found`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Reschedule request is already ${request.status}.`,
      );
    }

    const reviewerStaffId = currentUser.staff?.id ?? null;

    if (nextStatus === 'REJECTED') {
      request.status = 'REJECTED';
      request.reviewedByStaffId = reviewerStaffId;
      request.reviewNote = dto.reviewNote ?? null;
      return this.rescheduleRequestRepository.save(request);
    }

    const conflict = await this.roomConflictService.checkRoomConflict({
      roomId: request.newRoomId,
      dateOn: request.newDateOn,
      timeSlotIds: [request.newTimeSlotId],
      bookingStatuses: ['PENDING', 'APPROVED'],
      excludeSessionId: request.sessionId,
    });

    if (conflict.conflictingTimeSlotIds.length > 0) {
      throw new ConflictException({
        message: `Cannot approve reschedule. The room is occupied on ${request.newDateOn} for time slots: ${conflict.conflictingTimeSlotIds.join(
          ', ',
        )}. Please update the request before approving.`,
        conflicts: conflict.conflictingTimeSlotIds,
      });
    }

    return this.rescheduleRequestRepository.manager.transaction(
      async (manager) => {
        const session = await manager.findOne(ClassSession, {
          where: { id: request.sessionId },
          relations: ['room', 'timeSlot'],
        });

        if (!session) {
          throw new NotFoundException(
            `Class session with ID ${request.sessionId} not found`,
          );
        }

        const room = await manager.findOne(Room, {
          where: { id: request.newRoomId },
        });
        const timeSlot = await manager.findOne(TimeSlot, {
          where: { id: request.newTimeSlotId },
        });

        if (!room || !timeSlot) {
          throw new NotFoundException(
            'Room or time slot for reschedule no longer exists.',
          );
        }

        session.dateOn = request.newDateOn;
        session.room = room;
        session.timeSlot = timeSlot;
        session.status = 'RESCHEDULED';
        await manager.save(ClassSession, session);

        request.status = 'APPROVED';
        request.reviewedByStaffId = reviewerStaffId;
        request.reviewNote = dto.reviewNote ?? null;
        await manager.save(RescheduleRequest, request);

        return manager.getRepository(RescheduleRequest).findOne({
          where: { id: request.id },
          relations: [
            'session',
            'session.class',
            'session.course',
            'newRoom',
            'newTimeSlot',
          ],
        });
      },
    );
  }

  private ensureDateNotInPast(dateOn: string) {
    const requested = new Date(dateOn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requested < today) {
      throw new BadRequestException('Reschedule date cannot be in the past.');
    }
  }
}
