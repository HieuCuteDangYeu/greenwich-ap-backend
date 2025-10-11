import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('thread/:threadId')
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('threadId') threadId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createComment(
      req.user.id,
      Number(threadId),
      dto,
    );
  }

  @Get('thread/:threadId')
  async getThreadComments(@Param('threadId') threadId: string) {
    return this.commentService.findByThread(Number(threadId));
  }
}
