import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
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
  ApiDeleteOperation,
  ApiPaginationQuery,
} from '../../common/decorators/swagger.decorator';
import { ApiQuery } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffRole, UserRole } from '../../common/enums/roles.enum';
import { StaffRoles } from '../../common/decorators/staff-roles.decorator';

@ApiController('Departments', { requireAuth: true })
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly svc: DepartmentService) {}

  /** Create a department (admin only). */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Department)
  create(@Body() dto: CreateDepartmentDto) {
    return this.svc.create(dto);
  }

  /** List all departments (all roles). */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindAllOperation(Department)
  @ApiPaginationQuery()
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      search,
    });
  }

  /** Get a department by id (all roles). */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindOneOperation(Department)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  /** Update a department (admin only). */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Department)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.svc.update(id, dto);
  }

  /** Delete a department (admin only). */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Department)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
