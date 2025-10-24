import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { GoogleUserDto } from './dto/google-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { User } from '../user/entities/user.entity';
import bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../student/entities/student.entity';
import { randomBytes, randomUUID } from 'crypto';
import { StaffService } from '../staff/staff.service';
import { StudentService } from '../student/student.service';

@Injectable()
export class AuthService {
  private tempCodes = new Map<
    string,
    { data: GoogleUserDto; expiresAt: number }
  >();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly staffService: StaffService,
    private readonly studentService: StudentService,
  ) {}

  async handleGoogleLogin(profile: GoogleUserDto): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findByEmailWithRoleData(
        profile.email,
      );

      if (!user) {
        throw new UnauthorizedException('Unable to login');
      }

      const tokens = await this.generateTokens(user);
      await this.userService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        this.getRefreshTokenExpiryDate(),
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message);
      }
      throw new UnauthorizedException('Google login failed');
    }
  }
  async validateUserByJwt(
    payload: JwtPayload,
  ): Promise<User & { staff?: Staff; student?: Student }> {
    try {
      const user = await this.userService.findOneWithRoleData(
        parseInt(payload.sub),
      );

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.role) {
        throw new UnauthorizedException('User role not found');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('User validation failed');
    }
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findByEmailWithRoleData(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.password) {
        throw new UnauthorizedException('This account uses Google login only');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = await this.generateTokens(user);
      await this.userService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        this.getRefreshTokenExpiryDate(),
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message);
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { refreshToken } = refreshTokenDto;

      // Find user with the refresh token and preload role-specific data
      const user =
        await this.userService.findByRefreshTokenWithRoleData(refreshToken);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (
        !user.refreshTokenExpiresAt ||
        user.refreshTokenExpiresAt < new Date()
      ) {
        // Clear expired token
        await this.userService.clearRefreshToken(user.id);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Store new refresh token
      await this.userService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        this.getRefreshTokenExpiryDate(),
      );

      return tokens;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message);
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  private async generateTokens(
    user: User & { staff?: Staff; student?: Student },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role?.name ?? null,
    };

    if (user.surname) payload.surname = user.surname;
    if (user.givenName) payload.givenName = user.givenName;
    if (user.avatar) payload.avatar = user.avatar;

    const userRole = user.role?.name.toUpperCase();
    if (userRole === 'STAFF') {
      const staff =
        user.staff ?? (await this.staffService.findByUserId(user.id));
      if (staff) {
        payload.code = staff.staffCode;
        if (staff.role?.role) {
          payload.staffRole = staff.role.role;
        }
      }
    } else if (userRole === 'STUDENT') {
      const student =
        user.student ?? (await this.studentService.findByUserId(user.id));
      if (student) {
        payload.code = student.studentCode;
      }
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });

    const refreshToken = randomBytes(64).toString('hex');

    return { accessToken, refreshToken };
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresAt = new Date();
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

    // Parse expiry string (simple implementation for common formats)
    if (refreshTokenExpiry.endsWith('d')) {
      const days = parseInt(refreshTokenExpiry.slice(0, -1));
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (refreshTokenExpiry.endsWith('h')) {
      const hours = parseInt(refreshTokenExpiry.slice(0, -1));
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else if (refreshTokenExpiry.endsWith('m')) {
      const minutes = parseInt(refreshTokenExpiry.slice(0, -1));
      expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    } else {
      // Default to 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    return expiresAt;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.userService.clearExpiredRefreshTokens();
  }

  async logout(userId: number): Promise<void> {
    try {
      await this.userService.clearRefreshToken(userId);
    } catch (err: unknown) {
      console.error('Error during logout token cleanup:', err);
    }
  }

  createAuthCode(user: GoogleUserDto): string {
    const code = randomUUID();
    const expiresAt = Date.now() + 60 * 1000; // 1 minute expiry
    this.tempCodes.set(code, { data: user, expiresAt });
    return code;
  }

  verifyAuthCode(code: string): GoogleUserDto | null {
    const entry = this.tempCodes.get(code);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.tempCodes.delete(code);
      return null;
    }

    this.tempCodes.delete(code); // one-time use
    return entry.data;
  }
}
