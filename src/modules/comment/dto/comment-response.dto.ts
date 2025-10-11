import { Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UserSummaryDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;
}

export class CommentResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  @Type(() => UserSummaryDto)
  createdBy: UserSummaryDto;

  @ApiProperty()
  @Expose()
  @Type(() => UserSummaryDto)
  taggedUsers: UserSummaryDto[];

  @ApiProperty()
  @Expose()
  @Transform(({ obj }: { obj: { thread?: { id?: number } } }) => obj.thread?.id)
  threadId: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
