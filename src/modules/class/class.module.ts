import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { CourseModule } from '../course/course.module';
import { StudentModule } from '../student/student.module';
import { Room } from '../room/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassCourse, ClassSession, Room]),
    CourseModule,
    StudentModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
