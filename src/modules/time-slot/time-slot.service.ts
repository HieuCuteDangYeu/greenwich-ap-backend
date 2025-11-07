import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { AssignTimeSlotDto } from './dto/assign-time-slots.dto';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlot } from './entities/time-slot.entity';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
  ) {}

  create(createTimeSlotDto: CreateTimeSlotDto) {
    const timeSlot = this.timeSlotRepository.create(createTimeSlotDto);
    return this.timeSlotRepository.save(timeSlot);
  }

  findAll() {
    return this.timeSlotRepository.find();
  }

  async findOne(id: number) {
    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id },
    });

    if (!timeSlot) {
      throw new NotFoundException(`Time slot with ID ${id} not found`);
    }

    return timeSlot;
  }

  async update(id: number, updateTimeSlotDto: UpdateTimeSlotDto) {
    const timeSlot = await this.findOne(id);
    Object.assign(timeSlot, updateTimeSlotDto);
    return this.timeSlotRepository.save(timeSlot);
  }

  async remove(id: number) {
    const timeSlot = await this.findOne(id);
    await this.timeSlotRepository.remove(timeSlot);
  }

  async assignSlotToSession(assignTimeSlotDto: AssignTimeSlotDto) {
    const { sessionId, timeSlotId } = assignTimeSlotDto;

    const session = await this.classSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['timeSlot'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const timeSlot = await this.findOne(timeSlotId);

    // Assign (overwrite) the slot
    session.timeSlot = timeSlot;
    await this.classSessionRepository.save(session);

    return session;
  }

  async getSessionSlots(sessionId: number) {
    const session = await this.classSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['timeSlot'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    return session.timeSlot || null;
  }

  async removeSlotFromSession(sessionId: number, slotId: number) {
    const session = await this.classSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['timeSlot'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Clear the slot only if it matches the provided ID
    if (session.timeSlot && session.timeSlot.id === slotId) {
      session.timeSlot = null;
      await this.classSessionRepository.save(session);
    }

    return { message: 'Time slot removed from session' };
  }
}
