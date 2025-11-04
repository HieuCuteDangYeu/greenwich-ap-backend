import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceModule } from '../attendance/attendance.module';
import { CourseModule } from '../course/course.module';
import { Room } from '../room/entities/room.entity';
import { StudentModule } from '../student/student.module';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { Class } from './entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassCourse, ClassSession, Room]),
    CourseModule,
    StudentModule,
    AttendanceModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
