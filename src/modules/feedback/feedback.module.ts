import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../class/entities/class.entity';
import { Course } from '../course/entities/course.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../student/entities/student.entity';
import { Term } from '../term/entities/term.entity';
import { FeedbackQuestion } from './entities/feedback-question.entity';
import { FeedbackResponse } from './entities/feedback-response.entity';
import { FeedbackSubmission } from './entities/feedback-submission.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedbackQuestion,
      FeedbackResponse,
      FeedbackSubmission,
      Student,
      Staff,
      Course,
      Class,
      Term,
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
