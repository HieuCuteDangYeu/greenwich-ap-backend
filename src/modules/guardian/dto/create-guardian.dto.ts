import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
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

  @SwaggerProperty({ description: 'Occupation of guardian', required: true })
  @IsNotEmpty()
  @IsString()
  occupation?: string;
}
