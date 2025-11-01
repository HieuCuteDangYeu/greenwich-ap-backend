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
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { StudentService } from './student.service';

@ApiController('Students', { requireAuth: true })
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ------------ ADMIN ONLY ------------
  // CREATE
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateOperation(Student, 'Create new student')
  async create(@Body() dto: CreateStudentDto) {
    return await this.studentService.create(dto);
  }

  // READ all
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiFindAllOperation(Student)
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
    return this.studentService.findAll(opts);
  }

  // READ one
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiFindOneOperation(Student, 'Get student by ID')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateOperation(Student, 'Update student details')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  // DELETE (soft: set user status=INACTIVE)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdateStatusOperation(UpdateUserStatusDto, 'Update student status')
  async updateStudentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.studentService.updateStudentStatus(id, body.status);
  }
}
