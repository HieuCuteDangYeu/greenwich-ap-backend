import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateProgrammeDto {
  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name!: string;
}
