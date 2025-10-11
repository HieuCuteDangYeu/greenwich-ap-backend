import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('thread')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @UseGuards(RolesGuard)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateThreadDto) {
    return this.threadService.createThread(req.user.id, dto);
  }

  @Get()
  async list() {
    return this.threadService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.threadService.findOne(parseInt(id, 10));
  }
}
