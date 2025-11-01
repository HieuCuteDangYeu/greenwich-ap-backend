import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guardian } from './entities/guardian.entity';
import { Student } from '../student/entities/student.entity';
import { GuardianService } from './guardian.service';
import { GuardianController } from './guardian.controller';
import { UserModule } from '../user/user.module';
import { StudentGuardian } from './entities/student_guardian.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guardian, StudentGuardian, Student]),
    UserModule,
  ],
  providers: [GuardianService],
  controllers: [GuardianController],
  exports: [GuardianService],
})
export class GuardianModule {}
