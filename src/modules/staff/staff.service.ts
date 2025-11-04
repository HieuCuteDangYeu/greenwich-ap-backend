import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus } from '../user/dto/update-user-status.dto';
import { UserService } from '../user/user.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Staff } from './entities/staff.entity';
import { StaffRole } from './entities/staff_role.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(StaffRole)
    private readonly staffRoleRepo: Repository<StaffRole>,

    private readonly userService: UserService,
  ) {}

  // ======================
  //         CRUD
  // ======================

  // CREATE
  async create(dto: CreateStaffDto): Promise<Staff> {
    // Check staff code
    const staffCode = dto.staffCode ?? this.generateRandomStaffCode();
    const existing = await this.staffRepo.findOne({ where: { staffCode } });
    if (existing) throw new BadRequestException('Staff code already exists');

    // Create new user
    const user = await this.userService.create({
      ...dto.user,
      roleId: (await this.userService.findRoleByName('Staff')).id,
    });

    // Create new staff
    try {
      const staff = this.staffRepo.create({
        ...dto,
        staffCode,
        hireDate: new Date(dto.hireDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        user,
      });
      const savedStaff = await this.staffRepo.save(staff);

      if (dto.staffRole?.role) {
        await this.setStaffRole(savedStaff.id, dto.staffRole.role);
        savedStaff.role = await this.staffRoleRepo.findOne({
          where: { staffId: savedStaff.id },
        });
      }

      return savedStaff;
    } catch (error) {
      await this.userService.delete(user.id);
      throw error;
    }
  }

  // READ all with filters
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const qb = this.staffRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('u.campus', 'campus')
      .leftJoinAndMapOne('s.role', StaffRole, 'role', 'role.staffId = s.id');

    // Search by staff code, full name or email
    if (opts?.search) {
      qb.where(
        's.staffCode ILIKE :q OR u.fullName ILIKE :q OR u.email ILIKE :q',
        { q: `%${opts.search}%` },
      );
    }
    qb.orderBy('s.createdAt', 'DESC');
    if (opts?.limit) qb.take(opts.limit);
    if (opts?.page && opts.page > 0 && opts.limit)
      qb.skip((opts.page - 1) * opts.limit);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!staff) throw new NotFoundException(`Staff with ID ${id} not found`);
    staff.role = await this.staffRoleRepo.findOne({ where: { staffId: id } });
    return staff;
  }

  // UPDATE
  async update(id: number, dto: UpdateStaffDto): Promise<{ success: boolean }> {
    const staff = await this.findOne(id);

    // Update staff role
    if (dto.staffRole?.role) {
      await this.setStaffRole(staff.id, dto.staffRole.role);
    }

    // Update staffCode
    if (dto.staffCode) {
      const existingStaff = await this.staffRepo.findOne({
        where: { staffCode: dto.staffCode },
      });
      if (existingStaff && existingStaff.id !== id) {
        throw new BadRequestException('Staff code already exists');
      }
      staff.staffCode = dto.staffCode;
    }

    // Update related User
    if (dto.user) {
      await this.userService.update(staff.user.id, dto.user);
    }

    const updateFields: (keyof Omit<UpdateStaffDto, 'user' | 'staffRole'>)[] = [
      'status',
      'notes',
    ];

    const updates: Partial<
      Record<keyof UpdateStaffDto, string | number | null>
    > = {};

    updateFields.forEach((key) => {
      const value = dto[key];
      if (value !== undefined) {
        updates[key] = value ?? null;
      }
    });

    Object.assign(staff, updates);

    if (dto.hireDate !== undefined) {
      staff.hireDate = new Date(dto.hireDate);
    }

    await this.staffRepo.save(staff);
    return { success: true };
  }

  // DELETE (soft: set user status = INACTIVE)
  async updateStaffStatus(
    staffId: number,
    status: UserStatus,
  ): Promise<{ success: true }> {
    const staff = await this.staffRepo.findOne({
      where: { id: staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${staffId} not found`);
    }

    if (!staff.user || !staff.user.id) {
      throw new NotFoundException(
        `Related user not found for staff ${staffId}`,
      );
    }

    // Call userService to update the user status
    await this.userService.updateStatus(staff.user.id, status);
    await this.staffRepo.save(staff);
    return { success: true };
  }

  // =================================
  //            ROLE HELPER
  // =================================

  async getStaffRole(
    staffId: number,
  ): Promise<{ staffId: number; role: StaffRole['role'] } | null> {
    const staffRole = await this.staffRoleRepo.findOne({ where: { staffId } });
    if (!staffRole) return null;
    return { staffId, role: staffRole.role };
  }

  async setStaffRole(
    staffId: number,
    roleValue: StaffRole['role'],
  ): Promise<{ success: boolean }> {
    let role = await this.staffRoleRepo.findOne({ where: { staffId } });
    // Update role
    if (role) {
      role.role = roleValue;
      await this.staffRoleRepo.save(role);
      return { success: true };
    }
    // Create new role record if staff does not have role
    role = this.staffRoleRepo.create({ staffId, role: roleValue });
    await this.staffRoleRepo.save(role);
    return { success: true };
  }

  async removeRole(staffId: number): Promise<{ success: boolean }> {
    await this.staffRoleRepo.delete({ staffId });
    return { success: true };
  }

  async hasStaffRole(
    staffId: number,
    role: StaffRole['role'],
  ): Promise<boolean> {
    const currentRole = await this.getStaffRole(staffId);
    return currentRole?.role === role;
  }

  async findByUserId(userId: number): Promise<Staff | null> {
    return this.staffRepo.findOne({
      where: { userId },
      relations: ['role'],
    });
  }

  // =================================
  //            FUNCTION HELPER
  // =================================
  private generateRandomStaffCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FGW${result}`;
  }
}
