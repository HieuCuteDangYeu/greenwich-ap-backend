import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';
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
