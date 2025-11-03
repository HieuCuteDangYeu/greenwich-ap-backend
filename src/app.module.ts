import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { HealthController } from './health/health.controller';
import { AdminModule } from './modules/admin/admin.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampusModule } from './modules/campus/campus.module';
import { ClassModule } from './modules/class/class.module';
import { CommentModule } from './modules/comment/comment.module';
import { CourseModule } from './modules/course/course.module';
import { DepartmentModule } from './modules/department/department.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { ProgrammeModule } from './modules/programme/programme.module';
import { RoomModule } from './modules/room/room.module';
import { StaffModule } from './modules/staff/staff.module';
import { StudentModule } from './modules/student/student.module';
import { TermModule } from './modules/term/term.module';
import { ThreadModule } from './modules/thread/thread.module';
import { TimeSlotModule } from './modules/time-slot/time-slot.module';
import { UserModule } from './modules/user/user.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database') as TypeOrmModuleOptions,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AdminModule,
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
    ProgrammeModule,
    FeedbackModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
