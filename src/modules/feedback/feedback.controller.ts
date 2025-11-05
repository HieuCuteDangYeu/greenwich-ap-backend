import {
  BadRequestException,
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
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffRoles } from '../../common/decorators/staff-roles.decorator';
import {
  ApiController,
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  CommonApiResponses,
} from '../../common/decorators/swagger.decorator';
import { StaffRole, UserRole } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import { ApiFindAllOperation } from './../../common/decorators/swagger.decorator';
import { CreateFeedbackQuestionDto } from './dto/create-feedback.dto';
import { StudentFeedbackFormsResponseDto } from './dto/feedback-form.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { UpdateFeedbackQuestionDto } from './dto/update-feedback.dto';
import { FeedbackQuestion } from './entities/feedback-question.entity';
import { FeedbackService } from './feedback.service';

type AuthUser = User & { student?: Student; staff?: Staff };

@ApiController('Feedback', { requireAuth: true })
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // ===== QUESTION MANAGEMENT (Staff Only) =====

  @Post('questions')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiCreateOperation(
    FeedbackQuestion,
    'Create a new feedback question (Staff only)',
  )
  createQuestion(@Body() dto: CreateFeedbackQuestionDto) {
    return this.feedbackService.createQuestion(dto);
  }

  @Get('questions')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: String,
  })
  @ApiFindAllOperation(FeedbackQuestion, 'Get all feedback questions')
  findAllQuestions(@Query('includeInactive') includeInactive?: string) {
    return this.feedbackService.findAllQuestions(includeInactive === 'true');
  }

  @Get('questions/:id')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiFindOneOperation(FeedbackQuestion, 'Get a feedback question by ID')
  findQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findQuestionById(id);
  }

  @Patch('questions/:id')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiUpdateOperation(
    FeedbackQuestion,
    'Update a feedback question (Staff only)',
  )
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeedbackQuestionDto,
  ) {
    return this.feedbackService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiDeleteOperation(
    FeedbackQuestion,
    'Delete a feedback question (Staff only)',
  )
  deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.deleteQuestion(id);
  }

  // ===== STUDENT FEEDBACK =====

  @Get('student/forms')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all feedback forms for a student',
    description:
      'Returns all teachers/courses the student needs to evaluate in a term',
  })
  @CommonApiResponses()
  getStudentFeedbackForms(
    @CurrentUser() user: AuthUser,
    @Query('termId') termId?: string,
  ): Promise<StudentFeedbackFormsResponseDto> {
    const studentId = user.student?.id;
    if (!studentId) {
      throw new BadRequestException('Student ID not found in user context');
    }
    return this.feedbackService.getStudentFeedbackForms(
      studentId,
      termId ? parseInt(termId, 10) : undefined,
    );
  }

  @Post('submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Submit feedback for a teacher/course',
    description:
      'Student submits feedback answers for one teacher/course combination',
  })
  @CommonApiResponses()
  submitFeedback(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitFeedbackDto,
  ) {
    const studentId = user.student?.id;
    if (!studentId) {
      throw new BadRequestException('Student ID not found in user context');
    }
    return this.feedbackService.submitFeedback(studentId, dto);
  }

  @Patch('submission')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Update submitted feedback for a teacher/course',
    description:
      'Student updates their previously submitted feedback answers for one teacher/course combination',
  })
  @CommonApiResponses()
  updateFeedback(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitFeedbackDto,
  ) {
    const studentId = user.student?.id;
    if (!studentId) {
      throw new BadRequestException('Student ID not found in user context');
    }
    return this.feedbackService.updateFeedback(studentId, dto);
  }

  // ===== STAFF VIEW RESPONSES =====

  @Get('responses')
  @Roles(UserRole.STAFF)
  @StaffRoles(StaffRole.TEACHER)
  @ApiOperation({
    summary: 'Get feedback responses for a teacher (Staff only)',
    description: 'Teachers can view feedback they received',
  })
  @CommonApiResponses()
  getFeedbackResponses(
    @CurrentUser() user: AuthUser,
    @Query('courseId') courseId?: string,
    @Query('termId') termId?: string,
  ) {
    const staffId = user.staff?.id;
    if (!staffId) {
      throw new BadRequestException('Staff ID not found in user context');
    }
    return this.feedbackService.getFeedbackResponses(
      staffId,
      courseId ? parseInt(courseId, 10) : undefined,
      termId ? parseInt(termId, 10) : undefined,
    );
  }
}
