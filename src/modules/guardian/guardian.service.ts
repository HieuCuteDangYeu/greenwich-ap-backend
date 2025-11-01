import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardian } from './entities/guardian.entity';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { UserStatus } from '../user/dto/update-user-status.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class GuardianService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepo: Repository<Guardian>,

    private readonly userService: UserService,
  ) {}

  // CREATE
  async create(dto: CreateGuardianDto): Promise<Guardian> {
    // Create new user
    const user = await this.userService.create({
      ...dto.user,
      roleId: (await this.userService.findRoleByName('Guardian')).id,
    });

    // Create new guardian
    try {
      const guardian = this.guardianRepo.create({
        ...dto,
        user,
      });
      return await this.guardianRepo.save(guardian);
    } catch (error) {
      await this.userService.delete(user.id);
      throw error;
    }
  }

  // READ all with filters
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const qb = this.guardianRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.user', 'u')
      .leftJoinAndSelect('u.campus', 'campus');

    // Search by guardian's full name, email, or occupation
    if (opts?.search) {
      qb.where('u.fullName ILIKE :q OR u.email ILIKE :q', {
        q: `%${opts.search}%`,
      });
    }

    qb.orderBy('g.createdAt', 'DESC');

    // Apply pagination
    if (opts?.limit) qb.take(opts.limit);
    if (opts?.page && opts.page > 0 && opts.limit)
      qb.skip((opts.page - 1) * opts.limit);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Guardian> {
    const guardian = await this.guardianRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!guardian)
      throw new NotFoundException(`Guardian with ID ${id} not found`);
    return guardian;
  }

  // UPDATE
  async update(
    id: number,
    dto: UpdateGuardianDto,
  ): Promise<{ success: boolean }> {
    const guardian = await this.findOne(id);

    // Update related User
    if (dto.user) {
      await this.userService.update(guardian.user.id, dto.user);
    }

    const updateFields: (keyof Omit<UpdateGuardianDto, 'user'>)[] = [
      'occupation',
    ];

    const updates: Partial<
      Record<keyof UpdateGuardianDto, string | number | null>
    > = {};

    updateFields.forEach((key) => {
      const value = dto[key];
      if (value !== undefined) {
        updates[key] = value ?? null;
      }
    });

    Object.assign(guardian, updates);

    await this.guardianRepo.save(guardian);
    return { success: true };
  }

  // DELETE (soft: set user status = INACTIVE)
  async updateGuardianStatus(
    guardianId: number,
    status: UserStatus,
  ): Promise<{ success: true }> {
    const guardian = await this.guardianRepo.findOne({
      where: { id: guardianId },
      relations: ['user'],
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${guardianId} not found`);
    }

    if (!guardian.user || !guardian.user.id) {
      throw new NotFoundException(
        `Related user not found for guardian ${guardianId}`,
      );
    }

    // Call userService to update the user status
    await this.userService.updateStatus(guardian.user.id, status);
    await this.guardianRepo.save(guardian);
    return { success: true };
  }
}
