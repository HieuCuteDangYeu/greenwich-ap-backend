import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { UserModule } from '../user/user.module';
import { Guardian } from './entities/guardian.entity';
import { StudentGuardian } from './entities/student_guardian.entity';
import { GuardianController } from './guardian.controller';
import { GuardianService } from './guardian.service';

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
