import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class AssignClassesDto {
  @ApiProperty({
    description: 'Array of class IDs to assign to the student',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  classIds!: number[];
}
