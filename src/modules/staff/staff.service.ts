import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Staff } from './entities/staff.entity';
import { StaffRole } from './entities/staff_role.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

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

  async create(dto: CreateStaffDto): Promise<Staff> {
    return await this.staffRepo.manager.transaction(async (manager) => {
      let user: User;

      // No userId provided, add new user
      if (!dto.userId) {
        if (!dto.email) throw new BadRequestException('Email is required');

        // Check existing email
        const existingEmail = await this.userService.findByEmail(dto.email);
        if (existingEmail)
          throw new BadRequestException('Email already exists');

        // Find role 'Staff'
        const role = await this.userService.findRoleByName('Staff');

        const hashed = dto.password
          ? await bcrypt.hash(dto.password, 10)
          : null;

        // Add new user
        user = manager.create(User, {
          email: dto.email,
          password: hashed ?? undefined,
          givenName: dto.givenName,
          surname: dto.surname,
          campusId: dto.campusId,
          roleId: role.id,
        });
        await manager.save(user);
      } else {
        // If having userId, check it
        user = await this.userService.findOne(dto.userId);
        if (!user)
          throw new NotFoundException(`User with ID ${dto.userId} not found`);
        if (user.role?.name !== 'Staff') {
          throw new BadRequestException('User must have Staff role');
        }
      }

      // Add staffCode
      const staffCode =
        dto.staffCode ?? `FGWS${user.id.toString().padStart(5, '0')}`;
      const existing = await manager.findOne(Staff, { where: { staffCode } });
      if (existing) throw new BadRequestException('Staff code already exists');

      // Add staff record
      const staff = manager.create(Staff, {
        ...dto,
        staffCode,
        user,
        status: dto.status ?? 'ACTIVE',
      });

      return await manager.save(staff);
    });
  }

  async findAll() {
    return this.staffRepo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!staff) throw new NotFoundException(`Staff with ID ${id} not found`);
    return staff;
  }

  async update(id: number, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    Object.assign(staff, dto);
    return this.staffRepo.save(staff);
  }

  // DELETE (soft: set user status = INACTIVE)
  async deactivate(id: number): Promise<{ success: true }> {
    const staff = await this.findOne(id);
    if (!staff) {
      throw new NotFoundException(`Staff not found`);
    }

    await this.userService.deactivate(staff.user.id);
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
}
