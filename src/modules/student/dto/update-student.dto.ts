import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserInStudentDto } from './user-in-student.dto';

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['user'] as const),
) {
  @ApiPropertyOptional({ type: () => UserInStudentDto })
  @ValidateNested()
  @Type(() => UserInStudentDto)
  @IsOptional()
  user?: UserInStudentDto;
}
