import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiController,
  ApiCreateOperation,
  ApiUpdateOperation,
  ApiFindOneOperation,
  ApiFindAllOperation,
  ApiUpdateStatusOperation,
} from '../../common/decorators/swagger.decorator';
import { Staff } from './entities/staff.entity';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { SetStaffRoleDto } from './dto/set-staff-role.dto';
import { GetStaffRoleResponseDto } from './dto/get-staff-role-response.dto';
import { UserRole } from '../../common/enums/roles.enum';
import { UpdateUserStatusDto } from '../user/dto/update-user-status.dto';

@ApiController('Staffs', { requireAuth: true })
@Controller('staffs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // =================
  //       Staff
  // =================

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Staff)
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiFindAllOperation(Staff)
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiFindOneOperation(Staff)
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Staff)
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  // DELETE (soft: set user status = INACTIVE)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdateStatusOperation(UpdateUserStatusDto, 'Update staff status')
  async updateStaffStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.staffService.updateStaffStatus(id, body.status);
  }

  // =================
  //    Staff Role
  // =================

  @Get(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get staff role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the staff role',
    type: GetStaffRoleResponseDto,
  })
  async getRole(@Param('id') id: string): Promise<GetStaffRoleResponseDto> {
    const role = await this.staffService.getStaffRole(+id);
    if (!role) {
      throw new NotFoundException('Staff not found or no role assigned');
    }

    return role;
  }

  @Post(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set or update staff role' })
  setRole(@Param('id') id: string, @Body() body: SetStaffRoleDto) {
    return this.staffService.setStaffRole(+id, body.role);
  }

  @Delete(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove staff role' })
  removeRole(@Param('id') id: string) {
    return this.staffService.removeRole(+id);
  }
}
