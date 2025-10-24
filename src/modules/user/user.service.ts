import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Campus } from './entities/campus.entity';
import { Student } from '../student/entities/student.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';

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

  async create(dto: CreateUserDto): Promise<User> {
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const campus = dto.campusId
      ? await this.campusRepo.findOne({ where: { id: dto.campusId } })
      : null;
    if (dto.campusId && !campus)
      throw new NotFoundException('Campus not found');

    const hashed = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    const ent = this.userRepo.create({
      roleId: role.id,
      role,
      campusId: campus ? campus.id : null,
      campus: campus ?? null,
      email: dto.email,
      password: hashed,
      givenName: dto.givenName ?? null,
      surname: dto.surname ?? null,
      gender: dto.gender ?? 'UNSPECIFIED',
    } as Partial<User>);

    const savedUser = await this.userRepo.save(ent);

    const fullUser = await this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['role', 'campus'],
    });
    if (!fullUser) {
      throw new NotFoundException('User ID not found after creation');
    }

    if (role.name === 'Student') {
      let mentor = null;
      if (dto.mentorId) {
        mentor = await this.userRepo.findOne({ where: { id: dto.mentorId } });
        if (!mentor) throw new NotFoundException('Mentor not found');
      }

      const student = this.studentRepo.create({
        user: fullUser,
        studentCode: dto.studentCode ?? `GCS23000${savedUser.id}`,
        mentor,
      });
      await this.studentRepo.save(student);
    }

    return fullUser ?? savedUser;
  }

  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('u.campus', 'campus');
    if (opts?.search) {
      qb.where(
        'u.email ILIKE :q OR u.givenName ILIKE :q OR u.surname ILIKE :q',
        { q: `%${opts.search}%` },
      );
    }
    qb.orderBy('u.createdAt', 'DESC');
    if (opts?.limit) qb.take(opts.limit);
    if (opts?.page && opts.page > 0 && opts.limit)
      qb.skip((opts.page - 1) * opts.limit);
    return qb.getMany();
  }

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
  ): Promise<(User & { staff?: Staff; student?: Student }) | null> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role', 'campus'],
    });

    if (!user) {
      return null;
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
      return null;
    }

    return this.attachRoleSpecificData(user);
  }

  /**
   * Find user by refresh token with role-specific data (staff/student) eager loaded
   * This prevents N+1 queries during token refresh
   */
  async findByRefreshTokenWithRoleData(
    refreshToken: string,
  ): Promise<(User & { staff?: Staff; student?: Student }) | null> {
    const user = await this.userRepo.findOne({
      where: { refreshToken },
      relations: ['role', 'campus'],
    });

    if (!user) {
      return null;
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

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      user.roleId = role.id;
      user.role = role;
    }

    if (dto.campusId) {
      const campus = await this.campusRepo.findOne({
        where: { id: dto.campusId },
      });
      if (!campus) throw new NotFoundException('Campus not found');
      user.campusId = campus.id;
      user.campus = campus;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.givenName !== undefined) user.givenName = dto.givenName ?? null;
    if (dto.surname !== undefined) user.surname = dto.surname ?? null;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.phone !== undefined) user.phone = dto.phone ?? null;
    if (dto.phoneAlt !== undefined) user.phoneAlt = dto.phoneAlt ?? null;
    if (dto.address !== undefined) user.address = dto.address ?? null;
    if (dto.avatar !== undefined) user.avatar = dto.avatar ?? null;
    if (dto.note !== undefined) user.note = dto.note ?? null;
    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    return this.userRepo.save(user);
  }

  async updateProfile(userId: number, dto: UserProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User ID not found to update their profile');
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    return this.userRepo.save(user);
  }

  // ACTIVATE (set status = ACTIVE)
  async activate(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.status = 'ACTIVE';
    return await this.userRepo.save(user);
  }

  // DELETE (soft: set status = INACTIVE)
  async deactivate(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.status = 'INACTIVE';
    return await this.userRepo.save(user);
  }

  // DELETE (remove user)
  async remove(id: number): Promise<{ success: boolean }> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User ID not found to remove');
    }
    return { success: true };
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepo.update(userId, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });
  }

  async clearExpiredRefreshTokens(): Promise<void> {
    await this.userRepo.update(
      {
        refreshTokenExpiresAt: new Date(),
      },
      {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    );
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { name } });
    if (!role) throw new NotFoundException(`Role '${name}' not found`);
    return role;
  }
}
