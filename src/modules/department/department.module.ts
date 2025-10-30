import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Course } from '../course/entities/course.entity';
import { Programme } from '../programme/entities/programme.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Course, Department, Programme])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
