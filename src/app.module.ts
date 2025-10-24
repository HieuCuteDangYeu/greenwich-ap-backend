import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentModule } from './modules/student/student.module';
import { CourseModule } from './modules/course/course.module';
import { CampusModule } from './modules/campus/campus.module';
import { DepartmentModule } from './modules/department/department.module';
import { ClassModule } from './modules/class/class.module';
import { ThreadModule } from './modules/thread/thread.module';
import { CommentModule } from './modules/comment/comment.module';
import { RoomModule } from './modules/room/room.module';
import { TimeSlotModule } from './modules/time-slot/time-slot.module';
import { HealthController } from './health/health.controller';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { StaffModule } from './modules/staff/staff.module';
import { TermModule } from './modules/term/term.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database') as TypeOrmModuleOptions,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    StudentModule,
    CourseModule,
    CampusModule,
    DepartmentModule,
    ClassModule,
    ThreadModule,
    CommentModule,
    RoomModule,
    TimeSlotModule,
    AttendanceModule,
    GuardianModule,
    StaffModule,
    TermModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
