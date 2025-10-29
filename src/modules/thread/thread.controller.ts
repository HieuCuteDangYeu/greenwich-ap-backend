import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  ParseIntPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiDeleteOperation,
} from '../../common/decorators/swagger.decorator';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('threads')
@ApiController('Threads', { requireAuth: true })
@UseGuards(JwtAuthGuard)
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @ApiCreateOperation(ThreadResponseDto, 'Create a new thread')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateThreadDto,
  ): Promise<ThreadResponseDto> {
    return this.threadService.createThread(req.user.id, dto);
  }

  @Get()
  @ApiFindAllOperation(ThreadResponseDto, 'Retrieve all threads')
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<ThreadResponseDto[]> {
    return this.threadService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiFindOneOperation(ThreadResponseDto, 'Retrieve a single thread by ID')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ThreadResponseDto> {
    return this.threadService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @ApiDeleteOperation(ThreadResponseDto, 'Delete a thread by ID')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.threadService.deleteThread(req.user.id, id);
  }
}
