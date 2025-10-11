import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  taggedUserIds?: number[];
}
