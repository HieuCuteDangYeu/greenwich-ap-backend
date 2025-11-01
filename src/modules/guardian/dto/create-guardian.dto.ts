import { ApiProperty } from '@nestjs/swagger';
import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserInGuardianDto } from './user-in-guardian.dto';

export class CreateGuardianDto {
  @ApiProperty({
    description: 'User Info',
    type: () => UserInGuardianDto,
  })
  @ValidateNested()
  @Type(() => UserInGuardianDto)
  @IsNotEmpty()
  user!: UserInGuardianDto;

  @SwaggerProperty({ description: 'Occupation of guardian', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;
}
