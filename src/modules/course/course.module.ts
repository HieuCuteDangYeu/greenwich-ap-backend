import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Course, Department, Staff])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService, TypeOrmModule],
})
export class CourseModule {}
