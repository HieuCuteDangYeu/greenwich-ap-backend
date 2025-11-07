import { IsInt, IsPositive } from 'class-validator';
import { SwaggerProperty } from 'src/common/decorators/swagger.decorator';

export class AssignTimeSlotDto {
  @SwaggerProperty({
    description: 'The ID of the class session.',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  sessionId: number;

  @SwaggerProperty({
    description: 'The ID of the time slot to assign.',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  timeSlotId: number;
}
