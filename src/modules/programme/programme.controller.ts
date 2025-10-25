import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import {
  ApiController,
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiPaginationQuery,
  ApiUpdateOperation,
} from '../../common/decorators/swagger.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { ProgrammeService } from './programme.service';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';
import { Programme } from './entities/programme.entity';

@ApiController('Programmes', { requireAuth: true })
@Controller('programmes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgrammeController {
  constructor(private readonly svc: ProgrammeService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Programme)
  create(@Body() dto: CreateProgrammeDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @ApiFindAllOperation(Programme)
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter by programme code or name',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll({
      page,
      limit,
      search,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @ApiFindOneOperation(Programme)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Programme)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgrammeDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Programme)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
