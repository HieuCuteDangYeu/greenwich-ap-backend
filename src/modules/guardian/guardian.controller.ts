import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiPaginationQuery,
  ApiUpdateOperation,
  ApiUpdateStatusOperation,
} from '../../common/decorators/swagger.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserStatusDto } from '../user/dto/update-user-status.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { Guardian } from './entities/guardian.entity';
import { GuardianService } from './guardian.service';

@ApiController('Guardians', { requireAuth: true })
@Controller('guardians')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Guardian)
  create(@Body() dto: CreateGuardianDto) {
    return this.guardianService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiFindAllOperation(Guardian)
  @ApiPaginationQuery()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const opts = {
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      search,
    };
    return this.guardianService.findAll(opts);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiFindOneOperation(Guardian)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guardianService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Guardian)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(id, dto);
  }

  // DELETE (soft: set user status=INACTIVE)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdateStatusOperation(UpdateUserStatusDto, 'Update guardian status')
  async updateGuardianStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.guardianService.updateGuardianStatus(id, body.status);
  }
}
