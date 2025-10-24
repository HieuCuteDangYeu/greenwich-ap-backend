import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiController,
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiPaginationQuery,
  ApiUpdateOperation,
} from '../../common/decorators/swagger.decorator';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiQuery } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';

@ApiController('Rooms', { requireAuth: true })
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiCreateOperation(Room)
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Get()
  @ApiFindAllOperation(Room)
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'campusId',
    required: false,
    type: Number,
    description: 'Filter rooms by campus ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by code or name',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('campusId') campusId?: number,
    @Query('search') search?: string,
  ) {
    return this.roomService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      campusId: campusId ? Number(campusId) : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiFindOneOperation(Room)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiUpdateOperation(Room)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Room)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
