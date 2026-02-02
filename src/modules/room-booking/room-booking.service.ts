import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '../../common/enums/roles.enum';
import { RoomConflictService } from '../room-conflict/room-conflict.service';
import { Room } from '../room/entities/room.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { User } from '../user/entities/user.entity';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';
import { RoomBookingSlot } from './entities/room-booking-slot.entity';
import { BookingStatus, RoomBooking } from './entities/room-booking.entity';

type AuthUser = User & { role?: { name?: string } };

@Injectable()
export class RoomBookingService {
  constructor(
    @InjectRepository(RoomBooking)
    private readonly roomBookingRepository: Repository<RoomBooking>,
    @InjectRepository(RoomBookingSlot)
    private readonly roomBookingSlotRepository: Repository<RoomBookingSlot>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roomConflictService: RoomConflictService,
  ) {}

  async create(currentUserId: number, dto: CreateRoomBookingDto) {
    this.ensureDateNotInPast(dto.dateOn);

    const uniqueSlotIds = Array.from(new Set(dto.timeSlotIds));
    if (uniqueSlotIds.length !== dto.timeSlotIds.length) {
      throw new BadRequestException('Time slot IDs must be unique.');
    }

    const room = await this.roomRepository.findOne({
      where: { id: dto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
    }

    const requester = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const timeSlots = await this.timeSlotRepository.find({
      where: { id: In(uniqueSlotIds) },
    });
    if (timeSlots.length !== uniqueSlotIds.length) {
      const foundIds = new Set(timeSlots.map((slot) => slot.id));
      const missingIds = uniqueSlotIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Time slot IDs not found: ${missingIds.join(', ')}`,
      );
    }

    const conflict = await this.roomConflictService.checkRoomConflict({
      roomId: dto.roomId,
      dateOn: dto.dateOn,
      timeSlotIds: uniqueSlotIds,
      bookingStatuses: ['PENDING', 'APPROVED'],
    });

    if (conflict.conflictingTimeSlotIds.length > 0) {
      throw new ConflictException({
        message: `Room is already booked on ${dto.dateOn} for time slots: ${conflict.conflictingTimeSlotIds.join(
          ', ',
        )}. Please choose different slots.`,
        conflicts: conflict.conflictingTimeSlotIds,
      });
    }

    return this.roomBookingRepository.manager.transaction(async (manager) => {
      const booking = manager.create(RoomBooking, {
        room,
        roomId: room.id,
        requesterUser: requester,
        requesterUserId: requester.id,
        dateOn: dto.dateOn,
        purpose: dto.purpose ?? null,
        status: 'PENDING',
      });

      const savedBooking = await manager.save(RoomBooking, booking);

      const slots = timeSlots.map((timeSlot) =>
        manager.create(RoomBookingSlot, {
          booking: savedBooking,
          bookingId: savedBooking.id,
          timeSlot,
          timeSlotId: timeSlot.id,
          roomId: room.id,
          dateOn: dto.dateOn,
        }),
      );

      await manager.save(RoomBookingSlot, slots);

      return this.findOneWithManager(manager, savedBooking.id, requester);
    });
  }

  async findOne(id: number, currentUser?: AuthUser) {
    const booking = await this.roomBookingRepository.findOne({
      where: { id },
      relations: ['slots', 'slots.timeSlot', 'room', 'requesterUser'],
      order: { slots: { timeSlotId: 'ASC' } },
    });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    if (
      currentUser &&
      booking.requesterUserId !== currentUser.id &&
      !this.isStaffOrAdmin(currentUser)
    ) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  private async findOneWithManager(
    manager: Repository<RoomBooking>['manager'],
    id: number,
    currentUser?: AuthUser,
  ) {
    const booking = await manager.getRepository(RoomBooking).findOne({
      where: { id },
      relations: ['slots', 'slots.timeSlot', 'room', 'requesterUser'],
      order: { slots: { timeSlotId: 'ASC' } },
    });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    if (
      currentUser &&
      booking.requesterUserId !== currentUser.id &&
      !this.isStaffOrAdmin(currentUser)
    ) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  async findMyBookings(
    currentUserId: number,
    {
      status,
      from,
      to,
    }: { status?: BookingStatus; from?: string; to?: string } = {},
  ) {
    const qb = this.roomBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')
      .leftJoinAndSelect('booking.requesterUser', 'requesterUser')
      .leftJoinAndSelect('booking.slots', 'slots')
      .leftJoinAndSelect('slots.timeSlot', 'timeSlot')
      .where('booking.requester_user_id = :currentUserId', { currentUserId });

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }
    if (from) {
      qb.andWhere('booking.date_on >= :from', { from });
    }
    if (to) {
      qb.andWhere('booking.date_on <= :to', { to });
    }

    return qb.orderBy('booking.date_on', 'ASC').getMany();
  }

  async findAll({
    status,
    roomId,
    requesterUserId,
    from,
    to,
  }: {
    status?: BookingStatus;
    roomId?: number;
    requesterUserId?: number;
    from?: string;
    to?: string;
  } = {}) {
    const qb = this.roomBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.room', 'room')
      .leftJoinAndSelect('booking.requesterUser', 'requesterUser')
      .leftJoinAndSelect('booking.slots', 'slots')
      .leftJoinAndSelect('slots.timeSlot', 'timeSlot');

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }
    if (roomId) {
      qb.andWhere('booking.room_id = :roomId', { roomId });
    }
    if (requesterUserId) {
      qb.andWhere('booking.requester_user_id = :requesterUserId', {
        requesterUserId,
      });
    }
    if (from) {
      qb.andWhere('booking.date_on >= :from', { from });
    }
    if (to) {
      qb.andWhere('booking.date_on <= :to', { to });
    }

    return qb.orderBy('booking.date_on', 'ASC').getMany();
  }

  async approve(id: number) {
    const booking = await this.getBookingForStatusUpdate(id);

    const conflict = await this.roomConflictService.checkRoomConflict({
      roomId: booking.roomId,
      dateOn: booking.dateOn,
      timeSlotIds: booking.slots.map((slot) => slot.timeSlotId),
      bookingStatuses: ['PENDING', 'APPROVED'],
      excludeBookingId: booking.id,
    });

    if (conflict.conflictingTimeSlotIds.length > 0) {
      throw new ConflictException({
        message: `Cannot approve booking. Room is already booked on ${booking.dateOn} for time slots: ${conflict.conflictingTimeSlotIds.join(
          ', ',
        )}.`,
        conflicts: conflict.conflictingTimeSlotIds,
      });
    }

    booking.status = 'APPROVED';
    await this.roomBookingRepository.save(booking);
    return this.findOne(id);
  }

  async reject(id: number) {
    const booking = await this.getBookingForStatusUpdate(id);
    booking.status = 'REJECTED';
    await this.roomBookingRepository.save(booking);
    return this.findOne(id);
  }

  async cancel(id: number, currentUser: AuthUser) {
    const booking = await this.getBookingForStatusUpdate(id);

    const isOwner = booking.requesterUserId === currentUser.id;
    const isStaffOrAdmin = this.isStaffOrAdmin(currentUser);

    if (!isOwner && !isStaffOrAdmin) {
      throw new ForbiddenException(
        'Only the requester or staff/admin can cancel this booking.',
      );
    }

    booking.status = 'CANCELLED';
    await this.roomBookingRepository.save(booking);
    return this.findOne(id);
  }

  private async getBookingForStatusUpdate(id: number) {
    const booking = await this.roomBookingRepository.findOne({
      where: { id },
      relations: ['slots'],
    });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    return booking;
  }

  private ensureDateNotInPast(dateOn: string) {
    const requested = new Date(dateOn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requested < today) {
      throw new BadRequestException('Booking date cannot be in the past.');
    }
  }

  private isStaffOrAdmin(user?: AuthUser | null) {
    const role = user?.role?.name?.toUpperCase();
    return role === UserRole.ADMIN || role === UserRole.STAFF;
  }
}
