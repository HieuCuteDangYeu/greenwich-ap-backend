import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiPaginationQuery,
  ApiActivateOperation,
  ApiDeactivateOperation,
} from '../../common/decorators/swagger.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '../../common/enums/roles.enum';

interface JwtAuthRequest extends Request {
  user?: User;
}

@ApiController('Users', { requireAuth: true })
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ---------USERS---------
  // PATCH/users/me (Update own profile)
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated',
    type: User,
  })
  async updateMe(
    @Req() req: JwtAuthRequest,
    @Body() dto: UpdateOwnProfileDto,
  ): Promise<User> {
    if (!req.user) {
      throw new Error('No authenticated user found');
    }

    return await this.userService.updateProfile(req.user.id, dto);
  }

  // ---------ADMIN---------
  // CREATE
  @Post()
  @ApiCreateOperation(User)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // READ all
  @Get()
  @ApiFindAllOperation(User)
  @ApiPaginationQuery()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      search,
    });
  }

  // READ one
  @Get(':id')
  @ApiFindOneOperation(User)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiUpdateOperation(User)
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // ACTIVATE (soft: set status=ACTIVE)
  @Patch(':id/activate')
  @ApiActivateOperation(User)
  @Roles(UserRole.ADMIN)
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.userService.activate(id);
  }

  // DELETE (soft: set status=INACTIVE)
  @Patch(':id/deactivate')
  @ApiDeactivateOperation(User)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deactivate(id);
  }

  // DELETE (remove user)
  @Delete(':id')
  @ApiDeleteOperation(User)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
