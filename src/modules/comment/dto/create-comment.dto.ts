import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  taggedUserIds?: number[];
}
