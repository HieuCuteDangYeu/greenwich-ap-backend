import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleUserDto } from './dto/google-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { User } from '../user/entities/user.entity';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiController,
  CommonApiResponses,
} from '../../common/decorators/swagger.decorator';
import { LoginResponseDto, RefreshResponseDto } from './dto/login-response.dto';

interface GoogleAuthRequest extends Request {
  user?: GoogleUserDto;
}

interface JwtAuthRequest extends Request {
  user?: User;
}

@ApiController('Auth', { requireAuth: false })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
    };

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @CommonApiResponses()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const tokens = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    this.setAuthCookies(res, tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @CommonApiResponses()
  googleLogin(): void {
    // Passport handles redirection
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @CommonApiResponses()
  async googleCallback(
    @Req() req: GoogleAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user?.email) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const authCode = await this.authService.createAuthCode(req.user);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/bridge?code=${authCode}`;
    return res.redirect(redirectUrl);
  }

  @Post('exchange')
  @ApiOperation({ summary: 'Exchange OAuth code for tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { code: { type: 'string', example: '4/0AfJohX...' } },
      required: ['code'],
    },
  })
  @CommonApiResponses()
  async exchangeCode(
    @Body() body: { code: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const userData = await this.authService.verifyAuthCode(body.code);
    if (!userData) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const tokens = await this.authService.handleGoogleLogin(userData);
    this.setAuthCookies(res, tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get authenticated user details' })
  @ApiResponse({
    status: 200,
    description: "Returns the authenticated user's details",
    type: MeResponseDto,
  })
  @CommonApiResponses()
  me(@Req() req: JwtAuthRequest): MeResponseDto {
    if (!req.user)
      throw new UnauthorizedException('No authenticated user found');
    return plainToInstance(MeResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @CommonApiResponses()
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);
    this.setAuthCookies(res, tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user and revoke refresh tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @CommonApiResponses()
  async logout(
    @Req() req: JwtAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    if (!req.user)
      throw new UnauthorizedException('No authenticated user found');

    await this.authService.logout(req.user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logout successful' };
  }
}
