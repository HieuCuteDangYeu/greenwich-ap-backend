import { IsString, MinLength } from 'class-validator';
import { SwaggerProperty } from 'src/common/decorators/swagger.decorator';

export class CreateThreadDto {
  @SwaggerProperty({
    description: 'Title of the thread',
    example: 'Best practices for REST API design',
    required: true,
  })
  @IsString()
  @MinLength(5)
  title: string;
}
