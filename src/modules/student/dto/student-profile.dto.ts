import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { Student } from '../entities/student.entity';

export class StudentProfileDto {
  @ApiProperty({ description: 'Unique student code', required: true })
  @IsNotEmpty()
  @IsString()
  @Expose()
  studentCode!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const s = obj as Student;
    return s.user?.fullName ?? null;
  })
  fullName?: string | null;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const s = obj as Student;
    return s.user?.email ?? '';
  })
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const s = obj as Student;
    return s.user?.avatar ?? null;
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'Faculty name',
    example: 'Computing',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  faculty!: string;

  @ApiProperty({ description: 'Year', example: '1' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  year!: string;

  @ApiProperty({ description: 'Term', example: 'Spring 2025' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  term!: string;

  @ApiProperty({
    description: 'Campus name',
    example: 'Ho Chi Minh',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const s = obj as Student;
    return s.user?.campus?.name ?? '';
  })
  campus!: string;
}
