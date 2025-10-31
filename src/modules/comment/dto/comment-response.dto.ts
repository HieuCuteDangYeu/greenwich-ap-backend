import { Expose, Type } from 'class-transformer';
import { SwaggerProperty } from 'src/common/decorators/swagger.decorator';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class CommentResponseDto {
  @SwaggerProperty({ description: 'The unique ID of the comment.', example: 1 })
  @Expose()
  id: number;

  @SwaggerProperty({
    description: 'The content of the comment.',
    example: 'This is a great point!',
  })
  @Expose()
  content: string;

  @SwaggerProperty({
    description: 'User who created the comment.',
    type: () => UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto;

  @SwaggerProperty({
    description: 'List of users tagged in the comment.',
    type: () => UserResponseDto,
    isArray: true,
  })
  @Expose()
  @Type(() => UserResponseDto)
  taggedUsers: UserResponseDto[];

  @SwaggerProperty({
    description: 'Thread ID this comment belongs to.',
    example: 42,
  })
  @Expose()
  threadId: number;

  @SwaggerProperty({
    description: 'Created date of the comment.',
  })
  @Expose()
  createdAt: Date;

  @SwaggerProperty({
    description: 'Updated date of the comment.',
  })
  @Expose()
  updatedAt: Date;
}
