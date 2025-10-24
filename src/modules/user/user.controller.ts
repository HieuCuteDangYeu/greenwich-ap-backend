import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  ApiPaginationQuery,
  ApiUpdateStatusOperation,
} from '../../common/decorators/swagger.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '../../common/enums/roles.enum';

@ApiController('Users', { requireAuth: true })
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ---------ADMIN ONLY---------
  // CREATE
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(User)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // READ all
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiFindAllOperation(User)
  @ApiPaginationQuery()
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
  @Roles(UserRole.ADMIN)
  @ApiFindOneOperation(User)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(User)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // Soft DELETE (Update user status)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdateStatusOperation(UpdateUserStatusDto, 'Update user status')
  async updateUserStatus(
    @Param('id') id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(id, dto.status);
  }
}
