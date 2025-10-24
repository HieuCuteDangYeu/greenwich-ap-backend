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
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from '../user/entities/campus.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';

@ApiController('Campuses', { requireAuth: true })
@Controller('campuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampusController {
  constructor(private readonly svc: CampusService) {}

  /** Create a campus (admin only) */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Campus)
  create(@Body() dto: CreateCampusDto) {
    return this.svc.create(dto);
  }

  /** List campuses (all roles) */
  @Get()
  @ApiFindAllOperation(Campus)
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter by code or name',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      search,
    });
  }

  /** Get a campus by id (all roles) */
  @Get(':id')
  @ApiFindOneOperation(Campus)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  /** Update a campus (admin only) */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Campus)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCampusDto) {
    return this.svc.update(id, dto);
  }

  /** Delete a campus (admin only) */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Campus)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
