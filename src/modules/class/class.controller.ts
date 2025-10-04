import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  ApiController,
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
} from '../../common/decorators/swagger.decorator';
import { Class } from './entities/class.entity';
import { AddCourseDto } from './dto/add-course.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@ApiController('Classes')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @ApiCreateOperation(Class)
  @Post()
  @Roles('ADMIN', 'STAFF')
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @ApiFindAllOperation(Class)
  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @ApiFindOneOperation(Class)
  @ApiQuery({ name: 'include', required: false, isArray: true, type: String })
  @Get(':id')
  findOne(@Param('id') id: string, @Query('include') include: string[] = []) {
    return this.classService.findOne(+id, include);
  }

  @ApiUpdateOperation(Class)
  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(+id, updateClassDto);
  }

  @ApiDeleteOperation(Class)
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }

  @ApiOperation({ summary: 'Add a course to a class' })
  @Post(':id/courses')
  @Roles('ADMIN', 'STAFF')
  addCourse(@Param('id') id: string, @Body() addCourseDto: AddCourseDto) {
    return this.classService.addCourse(+id, addCourseDto);
  }

  @ApiOperation({ summary: 'Remove a course from a class' })
  @Delete(':id/courses/:courseId')
  @Roles('ADMIN', 'STAFF')
  removeCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.classService.removeCourse(+id, +courseId);
  }

  @ApiOperation({ summary: 'Get all students in a class' })
  @Get(':id/students')
  findStudentsByClass(@Param('id') id: string) {
    return this.classService.findStudentsByClass(+id);
  }

  @ApiOperation({ summary: 'Get all courses in a class' })
  @Get(':id/courses')
  findCoursesByClass(@Param('id') id: string) {
    return this.classService.findCoursesByClass(+id);
  }

  @ApiOperation({ summary: 'Create a session for a class' })
  @Post(':id/sessions')
  @Roles('ADMIN', 'STAFF')
  createSession(
    @Param('id') id: string,
    @Body() createSessionDto: CreateClassSessionDto,
  ) {
    return this.classService.createSession(+id, createSessionDto);
  }

  @ApiOperation({ summary: 'List sessions of a class' })
  @Get(':id/sessions')
  findSessions(@Param('id') id: string) {
    return this.classService.findSessions(+id);
  }

  @ApiOperation({ summary: 'Get a specific class session' })
  @Get(':id/sessions/:sessionId')
  findSession(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.classService.findSession(+id, +sessionId);
  }

  @ApiOperation({ summary: 'Update a class session' })
  @Patch(':id/sessions/:sessionId')
  @Roles('ADMIN', 'STAFF')
  updateSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: UpdateClassSessionDto,
  ) {
    return this.classService.updateSession(+id, +sessionId, updateSessionDto);
  }

  @ApiOperation({ summary: 'Remove a class session' })
  @Delete(':id/sessions/:sessionId')
  @Roles('ADMIN', 'STAFF')
  removeSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.classService.removeSession(+id, +sessionId);
  }
}
