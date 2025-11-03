import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QuestionOption } from '../../common/types/question-option.enum';
import { Class } from '../class/entities/class.entity';
import { Course } from '../course/entities/course.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Student } from '../student/entities/student.entity';
import { Term } from '../term/entities/term.entity';
import { CreateFeedbackQuestionDto } from './dto/create-feedback.dto';
import {
  FeedbackFormDto,
  StudentFeedbackFormsResponseDto,
} from './dto/feedback-form.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { UpdateFeedbackQuestionDto } from './dto/update-feedback.dto';
import { FeedbackQuestion } from './entities/feedback-question.entity';
import { FeedbackResponse } from './entities/feedback-response.entity';
import { FeedbackSubmission } from './entities/feedback-submission.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackQuestion)
    private feedbackQuestionRepository: Repository<FeedbackQuestion>,
    @InjectRepository(FeedbackResponse)
    private feedbackResponseRepository: Repository<FeedbackResponse>,
    @InjectRepository(FeedbackSubmission)
    private feedbackSubmissionRepository: Repository<FeedbackSubmission>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Term)
    private termRepository: Repository<Term>,
  ) {}

  private validateQuestionOptions(options: QuestionOption[]): void {
    if (!options || options.length === 0) {
      return;
    }

    // Check for duplicate option values
    const optionValues = options.map((opt) => opt.value);
    const uniqueValues = new Set(optionValues);
    if (optionValues.length !== uniqueValues.size) {
      throw new BadRequestException(
        'Option values must be unique within a question',
      );
    }

    // Validate each option has required fields
    for (const option of options) {
      if (!option.value || !option.label) {
        throw new BadRequestException(
          'Each option must have both value and label fields',
        );
      }
    }
  }

  async createQuestion(
    dto: CreateFeedbackQuestionDto,
  ): Promise<FeedbackQuestion> {
    // Validate options if provided
    this.validateQuestionOptions(dto.options);

    const question = this.feedbackQuestionRepository.create(dto);
    return this.feedbackQuestionRepository.save(question);
  }

  async findAllQuestions(includeInactive = false): Promise<FeedbackQuestion[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.feedbackQuestionRepository.find({
      where,
      order: { questionOrder: 'ASC' },
    });
  }

  async findQuestionById(id: number): Promise<FeedbackQuestion> {
    const question = await this.feedbackQuestionRepository.findOne({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException(`Feedback question with ID ${id} not found`);
    }
    return question;
  }

  async updateQuestion(
    id: number,
    dto: UpdateFeedbackQuestionDto,
  ): Promise<FeedbackQuestion> {
    const question = await this.findQuestionById(id);

    // Validate options if they are being updated
    if (dto.options) {
      this.validateQuestionOptions(dto.options);
    }

    Object.assign(question, dto);
    return this.feedbackQuestionRepository.save(question);
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.findQuestionById(id);
    await this.feedbackQuestionRepository.remove(question);
  }

  // Get feedback forms for a student
  async getStudentFeedbackForms(
    studentId: number,
    termId?: number,
  ): Promise<StudentFeedbackFormsResponseDto> {
    // Get student with their class
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class', 'user'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    if (!student.classId) {
      return { forms: [], questions: [] };
    }

    // Get active questions
    const questions = await this.findAllQuestions(false);

    // Get all courses for the student's class
    const classEntity = await this.classRepository.findOne({
      where: { id: student.classId },
      relations: ['classCourses', 'classCourses.course'],
    });

    if (!classEntity || !classEntity.classCourses) {
      return { forms: [], questions: [] };
    }

    // Get terms (filter by termId if provided)
    const termWhere = termId ? { id: termId } : {};
    const terms = await this.termRepository.find({ where: termWhere });

    if (terms.length === 0) {
      return { forms: [], questions: [] };
    }

    // Get all courses with teachers
    const courseIds = classEntity.classCourses.map((cc) => cc.course.id);
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
    });

    // Get teacher information
    const teacherIds = courses
      .map((c) => c.teacherId)
      .filter((id): id is number => id !== null && id !== undefined);

    const teachers = await this.staffRepository.find({
      where: { id: In(teacherIds) },
      relations: ['user', 'role'],
    });

    // Filter teachers with TEACHER role
    const teacherMap = new Map(
      teachers.filter((t) => t.role?.role === 'TEACHER').map((t) => [t.id, t]),
    );

    // Get existing submissions
    const submissions = await this.feedbackSubmissionRepository.find({
      where: {
        studentId: student.id,
        termId: termId || In(terms.map((t) => t.id)),
      },
    });

    const submissionSet = new Set(
      submissions.map(
        (s) => `${s.staffId}-${s.courseId}-${s.classId}-${s.termId}`,
      ),
    );

    // Build feedback forms
    const forms: FeedbackFormDto[] = [];

    for (const term of terms) {
      for (const course of courses) {
        if (course.teacherId && teacherMap.has(course.teacherId)) {
          const teacher = teacherMap.get(course.teacherId)!;
          const key = `${teacher.id}-${course.id}-${classEntity.id}-${term.id}`;

          forms.push({
            staffId: teacher.id,
            teacherName: `${teacher.user?.fullName || 'Unknown'}`,
            staffCode: teacher.staffCode,
            courseId: course.id,
            courseName: course.title,
            classCode: `${classEntity.name}`,
            classId: classEntity.id,
            termId: term.id,
            isSubmitted: submissionSet.has(key),
          });
        }
      }
    }

    return {
      forms,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionTextVi: q.questionTextVi,
        questionType: q.questionType,
        questionOrder: q.questionOrder,
        options: q.options,
      })),
    };
  }

  // Submit feedback
  async submitFeedback(
    studentId: number,
    dto: SubmitFeedbackDto,
  ): Promise<{ message: string; submissionId: number }> {
    // Verify entities exist
    const [student, staff, course, classEntity, term] = await Promise.all([
      this.studentRepository.findOne({ where: { id: studentId } }),
      this.staffRepository.findOne({
        where: { id: dto.staffId },
        relations: ['role'],
      }),
      this.courseRepository.findOne({ where: { id: dto.courseId } }),
      this.classRepository.findOne({ where: { id: dto.classId } }),
      this.termRepository.findOne({ where: { id: dto.termId } }),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${dto.staffId} not found`);
    }
    if (staff.role?.role !== 'TEACHER') {
      throw new BadRequestException('Staff member is not a teacher');
    }
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${dto.classId} not found`);
    }
    if (!term) {
      throw new NotFoundException(`Term with ID ${dto.termId} not found`);
    }

    // Check if already submitted
    const existingSubmission = await this.feedbackSubmissionRepository.findOne({
      where: {
        studentId,
        staffId: dto.staffId,
        courseId: dto.courseId,
        termId: dto.termId,
      },
    });

    if (existingSubmission) {
      throw new ConflictException(
        'Feedback has already been submitted for this teacher/course combination',
      );
    }

    // Verify all questions are active and validate answer options
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.feedbackQuestionRepository.find({
      where: { id: In(questionIds), isActive: true },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException('Some questions are invalid or inactive');
    }

    // Create a map of questions for easy lookup (convert string IDs to numbers)
    const questionMap = new Map(questions.map((q) => [Number(q.id), q]));

    // Validate that each answer's selected option matches the question's available options
    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} not found`,
        );
      }

      const validOptions = question.options.map((opt) => opt.value);
      if (!validOptions.includes(answer.selectedOption)) {
        throw new BadRequestException(
          `Invalid option "${answer.selectedOption}" for question "${question.questionText}". Valid options are: ${validOptions.join(', ')}`,
        );
      }
    }

    // Save responses
    const responses = dto.answers.map((answer) => {
      return this.feedbackResponseRepository.create({
        studentId,
        staffId: dto.staffId,
        courseId: dto.courseId,
        classId: dto.classId,
        termId: dto.termId,
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
      });
    });

    await this.feedbackResponseRepository.save(responses);

    // Save submission record
    const submission = this.feedbackSubmissionRepository.create({
      studentId,
      staffId: dto.staffId,
      courseId: dto.courseId,
      classId: dto.classId,
      termId: dto.termId,
      notes: dto.notes,
    });

    const savedSubmission =
      await this.feedbackSubmissionRepository.save(submission);

    return {
      message: 'Feedback submitted successfully',
      submissionId: savedSubmission.id,
    };
  }

  // Get feedback responses for a teacher/course (for staff to view)
  async getFeedbackResponses(
    staffId: number,
    courseId?: number,
    termId?: number,
  ) {
    interface WhereCondition {
      staffId: number;
      courseId?: number;
      termId?: number;
    }

    const where: WhereCondition = { staffId };
    if (courseId) where.courseId = courseId;
    if (termId) where.termId = termId;

    const responses = await this.feedbackResponseRepository.find({
      where,
      relations: ['question', 'student', 'student.user', 'course', 'term'],
      order: { createdAt: 'DESC' },
    });

    const submissions = await this.feedbackSubmissionRepository.find({
      where,
      relations: ['student', 'student.user', 'course', 'term'],
      order: { submittedAt: 'DESC' },
    });

    return { responses, submissions };
  }
}
