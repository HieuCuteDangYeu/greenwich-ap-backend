import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
} from '../../common/decorators/swagger.decorator';
import { GuardianService } from './guardian.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { GuardianResponseDto } from './dto/guardian-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUserStatusDto } from '../user/dto/update-user-status.dto';
@ApiController('Guardians', { requireAuth: true })
@Controller('guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Post()
  @ApiCreateOperation(GuardianResponseDto, 'Create a new guardian')
  create(@Body() dto: CreateGuardianDto) {
    return this.guardianService.create(dto);
  }

  @Get()
  @ApiFindAllOperation(GuardianResponseDto, 'Get all guardians')
  findAll() {
    return this.guardianService.findAll();
  }

  @Get(':id')
  @ApiFindOneOperation(GuardianResponseDto, 'Get a guardian by ID')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guardianService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateOperation(GuardianResponseDto, 'Update a guardian by ID')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(id, dto);
  }

  // DELETE (soft: set user status=INACTIVE)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guardian status' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guardian status has been successfully updated',
  })
  async updateGuardianStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.guardianService.updateGuardianStatus(id, body.status);
  }
}
