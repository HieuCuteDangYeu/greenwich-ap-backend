import { ApiProperty } from '@nestjs/swagger';
import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
import { MeResponseDto } from './me-response.dto';

export class LoginResponseDto {
  @SwaggerProperty({ description: 'JWT access token' })
  accessToken!: string;

  @SwaggerProperty({ description: 'JWT refresh token' })
  refreshToken!: string;

  @ApiProperty({ type: MeResponseDto })
  user?: MeResponseDto;
}

export class RefreshResponseDto {
  @SwaggerProperty({ description: 'New JWT access token' })
  accessToken!: string;

  @SwaggerProperty({ description: 'New refresh token' })
  refreshToken!: string;
}
