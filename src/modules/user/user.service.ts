import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserStatus } from './dto/update-user-status.dto';
import { Role } from './entities/role.entity';
import { Campus } from './entities/campus.entity';
import { Student } from '../student/entities/student.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Campus) private readonly campusRepo: Repository<Campus>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  // CREATE
  async create(dto: CreateUserDto): Promise<User> {
    const [role, campus] = await Promise.all([
      this.roleRepo.findOne({ where: { id: dto.roleId } }),
      this.campusRepo.findOne({ where: { id: dto.campusId } }),
    ]);

    if (!role) throw new NotFoundException('Role not found');
    if (!campus) throw new NotFoundException('Campus not found');

    // Check existing email
    const existingEmail = await this.findByEmail(dto.email);
    if (existingEmail) throw new BadRequestException('Email already exists');

    const user = this.userRepo.create({
      ...dto,
      roleId: role.id,
      campusId: campus.id,
    });
    const saved = await this.userRepo.save(user);

    const fullUser = await this.userRepo.findOne({
      where: { id: saved.id },
      relations: ['role', 'campus'],
    });
    if (!fullUser) throw new NotFoundException('User not found after creation');

    return fullUser;
  }

  // READ all
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('u.campus', 'campus');
    if (opts?.search) {
      qb.where('u.email ILIKE :q OR u.fullName ILIKE :q', {
        q: `%${opts.search}%`,
      });
    }
    qb.orderBy('u.createdAt', 'DESC');
    if (opts?.limit) qb.take(opts.limit);
    if (opts?.page && opts.page > 0 && opts.limit)
      qb.skip((opts.page - 1) * opts.limit);
    return qb.getMany();
  }

  // READ one
  async findOne(id: number): Promise<User> {
    const u = await this.userRepo.findOne({
      where: { id },
      relations: ['role', 'campus'],
    });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  /**
   * Find user by ID with role-specific data (staff/student) eager loaded
   * This prevents N+1 queries during JWT validation
   */
  async findOneWithRoleData(
    id: number,
  ): Promise<User & { staff?: Staff; student?: Student }> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role', 'campus'],
    });

    if (!user) {
      throw new NotFoundException('User not found by ID');
    }

    return this.attachRoleSpecificData(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role', 'campus'],
    });
  }

  /**
   * Find user by email with role-specific data (staff/student) eager loaded
   * This prevents N+1 queries during authentication
   */
  async findByEmailWithRoleData(
    email: string,
  ): Promise<(User & { staff?: Staff; student?: Student }) | null> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['role', 'campus'],
    });

    if (!user) {
      throw new NotFoundException('User not found by email');
    }

    return this.attachRoleSpecificData(user);
  }

  /**
   * Helper method to attach role-specific data to a user
   * Loads staff or student data based on user's role
   */
  private async attachRoleSpecificData(
    user: User,
  ): Promise<User & { staff?: Staff; student?: Student }> {
    const userRole = user.role?.name.toUpperCase();
    const enrichedUser = user as User & { staff?: Staff; student?: Student };

    if (userRole === 'STAFF') {
      const staff = await this.staffRepo.findOne({
        where: { userId: user.id },
        relations: ['role'],
      });
      if (staff) {
        enrichedUser.staff = staff;
      }
    } else if (userRole === 'STUDENT') {
      const student = await this.studentRepo.findOne({
        where: { userId: user.id },
      });
      if (student) {
        enrichedUser.student = student;
      }
    }

    return enrichedUser;
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Role '${name}' not found`);
    return role;
  }

  // UPDATE
  async update(id: number, dto: UpdateUserDto): Promise<{ success: boolean }> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      user.role = role;
      user.roleId = dto.roleId;
    }

    if (dto.campusId) {
      const campus = await this.campusRepo.findOne({
        where: { id: dto.campusId },
      });
      if (!campus) throw new NotFoundException('Campus not found');
      user.campus = campus;
      user.campusId = dto.campusId;
    }

    const updateFields: (keyof UpdateUserDto)[] = [
      'email',
      'givenName',
      'middleName',
      'surname',
      'gender',
      'phone',
      'phoneAlt',
      'address',
      'avatar',
      'note',
    ];

    // Add temporary object with keyof UpdateUserDto and can have value string, number, null
    const updates: Partial<
      Record<keyof UpdateUserDto, string | number | null>
    > = {};

    updateFields.forEach((key) => {
      const value = dto[key];
      if (value !== undefined) {
        updates[key] = value ?? null;
      }
    });

    Object.assign(user, updates);

    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    await this.userRepo.save(user);
    return { success: true };
  }

  // DELETE => Update User Status (ACTIVE, INACTIVE)
  async updateStatus(
    id: number,
    status: UserStatus,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    user.status = status;
    await this.userRepo.save(user);
    return { success: true };
  }

  // DELETE (remove user)
  async delete(id: number): Promise<{ success: boolean }> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User ID not found to delete');
    }
    return { success: true };
  }

  async findByRefreshTokenWithRoleData(
    refreshToken: string,
  ): Promise<User & { staff?: Staff; student?: Student }> {
    const user = await this.userRepo.findOne({
      where: { refreshToken },
      relations: ['role', 'campus'],
    });

    if (!user) {
      throw new NotFoundException('User not found by refresh token');
    }

    return this.attachRoleSpecificData(user);
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    try {
      await this.userRepo.update(userId, {
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
      });
    } catch (error) {
      console.error('Error updating refresh token:', error);
    }
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });
  }

  async clearExpiredRefreshTokens(): Promise<void> {
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        refreshToken: null,
        refreshTokenExpiresAt: null,
      })
      .where('refresh_token_expires_at <= :now', { now: new Date() })
      .execute();
  }
}
