import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programme } from './entities/programme.entity';
import { ProgrammeService } from './programme.service';
import { ProgrammeController } from './programme.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Programme])],
  controllers: [ProgrammeController],
  providers: [ProgrammeService],
  exports: [ProgrammeService],
})
export class ProgrammeModule {}
