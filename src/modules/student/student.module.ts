import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../class/entities/class.entity';
import { StaffModule } from '../staff/staff.module';
import { Term } from '../term/entities/term.entity';
import { UserModule } from '../user/user.module';
import { Student } from './entities/student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Class, Term]),
    UserModule,
    StaffModule,
  ],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [StudentService, TypeOrmModule],
})
export class StudentModule {}
