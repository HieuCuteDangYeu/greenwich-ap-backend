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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
import { TermService } from './term.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { Term } from './entities/term.entity';
import { UserRole } from '../../common/enums/roles.enum';
@ApiController('Terms')
@Controller('terms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TermController {
  constructor(private readonly svc: TermService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Term)
  create(@Body() dto: CreateTermDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @ApiFindAllOperation(Term)
  @ApiPaginationQuery()
  @ApiQuery({ name: 'programmeId', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'academicYear', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('programmeId', new ParseIntPipe({ optional: true }))
    programmeId?: number,
    @Query('departmentId', new ParseIntPipe({ optional: true }))
    departmentId?: number,
    @Query('academicYear') academicYear?: string,
    @Query('code') code?: string,
    @Query('name') name?: string,
  ) {
    return this.svc.findAll({
      page,
      limit,
      programmeId,
      departmentId,
      academicYear,
      code,
      name,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GUARDIAN, UserRole.STAFF, UserRole.STUDENT)
  @ApiFindOneOperation(Term)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Term)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTermDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Term)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
