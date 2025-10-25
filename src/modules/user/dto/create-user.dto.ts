import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @SwaggerProperty({
    description: 'Email address',
    example: 'alice@example.com',
  })
  @IsEmail()
  email!: string;

  @SwaggerProperty({ description: 'Role id (existing role)' })
  @IsNumber()
  roleId!: number;

  @SwaggerProperty({
    description: 'Campus id',
    example: '1',
  })
  @IsOptional()
  @IsNumber()
  campusId?: number;

  @SwaggerProperty({ description: 'Given name', required: false })
  @IsOptional()
  @IsString()
  givenName?: string;

  @SwaggerProperty({ description: 'Middle name', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @SwaggerProperty({ description: 'Surname', required: false })
  @IsOptional()
  @IsString()
  surname?: string;

  @SwaggerProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @SwaggerProperty({ description: 'Alternative phone', required: false })
  @IsOptional()
  @IsString()
  phoneAlt?: string;

  @SwaggerProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @SwaggerProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @SwaggerProperty({ description: 'Note', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @SwaggerProperty({
    description: 'Date of birth',
    example: '2025-09-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @SwaggerProperty({
    description: 'Gender',
    required: false,
    enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'],
  })
  @IsOptional()
  @IsEnum([
    'MALE' as const,
    'FEMALE' as const,
    'OTHER' as const,
    'UNSPECIFIED' as const,
  ])
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
}
