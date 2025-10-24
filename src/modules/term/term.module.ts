import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermService } from './term.service';
import { TermController } from './term.controller';
import { Term } from './entities/term.entity';
import { Programme } from '../programme/entities/programme.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Term, Programme, Department])],
  controllers: [TermController],
  providers: [TermService],
  exports: [TermService],
})
export class TermModule {}
