import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { QuestionType } from '../../common/enums/question-type.enum';
import { Admin } from '../../modules/admin/entities/admin.entity';
import { FeedbackQuestion } from '../../modules/feedback/entities/feedback-question.entity';
import { Campus } from '../../modules/user/entities/campus.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { User } from '../../modules/user/entities/user.entity';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: isProduction
    ? [path.join(__dirname, '../../modules/**/*.entity.js')]
    : [path.join(__dirname, '../../modules/**/*.entity.{ts,js}')],

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const AppDataSource = new DataSource(config);

export const seed = async (): Promise<void> => {
  console.log('Starting Seed Script...');

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database Connected successfully.');
    }

    const campusRepo = AppDataSource.getRepository(Campus);
    const campusData = [
      { code: 'HCM', name: 'Ho Chi Minh' },
      { code: 'HN', name: 'Ha Noi' },
      { code: 'DN', name: 'Da Nang' },
      { code: 'CT', name: 'Can Tho' },
    ];

    for (const campus of campusData) {
      const exists = await campusRepo.findOne({ where: { code: campus.code } });
      if (!exists) {
        console.log(`   + Creating Campus: ${campus.name}`);
        await campusRepo.save(campus);
      }
    }

    const roleRepo = AppDataSource.getRepository(Role);
    const roleData = [
      { name: 'Admin' },
      { name: 'Student' },
      { name: 'Staff' },
      { name: 'Guardian' },
    ];

    for (const role of roleData) {
      const exists = await roleRepo.findOne({ where: { name: role.name } });
      if (!exists) {
        console.log(`   + Creating Role: ${role.name}`);
        await roleRepo.save(role);
      }
    }

    const userRepo = AppDataSource.getRepository(User);
    const adminRepo = AppDataSource.getRepository(Admin);
    const adminEmail = process.env.PGADMIN_EMAIL || 'admin@greenwich.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminRole = await roleRepo.findOne({ where: { name: 'Admin' } });
    const hcmCampus = await campusRepo.findOne({ where: { code: 'HCM' } });

    if (!adminRole || !hcmCampus) {
      throw new Error(
        'Critical Error: Admin role or Ho Chi Minh campus not found. Seeding aborted.',
      );
    }

    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      console.log(`   + Creating Admin User (${adminEmail})...`);
      const adminUser = await userRepo.save({
        email: adminEmail,
        roleId: adminRole.id,
        campusId: hcmCampus.id,
        fullName: 'System Administrator',
        code: 'ADMIN001',
        phoneNumber: '0000000000',
      });

      await adminRepo.save({
        userId: adminUser.id,
        password: hashedPassword,
      });
    } else {
      console.log('   - Admin user already exists. Skipping.');
    }

    // 5. Seed Feedback Questions
    const feedbackQuestionRepo = AppDataSource.getRepository(FeedbackQuestion);
    const existingQuestionsCount = await feedbackQuestionRepo.count();

    if (existingQuestionsCount === 0) {
      console.log('   + Seeding initial Feedback Questions...');
      const questions = [
        {
          questionText: "Regarding the teacher's punctuality",
          questionTextVi: 'Về sự đúng giờ của giảng viên',
          questionType: QuestionType.MULTIPLE_CHOICE,
          questionOrder: 1,
          isActive: true,
          options: [
            {
              value: 'ALWAYS_PUNCTUAL',
              label: 'Always punctual',
              labelVi: 'Luôn đúng giờ',
            },
            {
              value: 'MOSTLY_PUNCTUAL',
              label: 'Mostly punctual',
              labelVi: 'Phần lớn đúng giờ',
            },
            {
              value: 'RARELY_PUNCTUAL',
              label: 'Rarely punctual',
              labelVi: 'Ít đúng giờ',
            },
            {
              value: 'NOT_AT_ALL_PUNCTUAL',
              label: 'Not at all punctual',
              labelVi: 'Không đúng giờ',
            },
          ],
        },
        {
          questionText:
            'The teacher adequately covers the topics required by the syllabus',
          questionTextVi:
            'Giảng viên giảng dạy đầy đủ các chủ đề theo yêu cầu của đề cương môn học',
          questionType: QuestionType.MULTIPLE_CHOICE,
          questionOrder: 2,
          isActive: true,
          options: [
            {
              value: 'FULLY_COVERED',
              label: 'Fully covered',
              labelVi: 'Đầy đủ toàn bộ',
            },
            {
              value: 'MOSTLY_COVERED',
              label: 'Mostly covered',
              labelVi: 'Phần lớn đầy đủ',
            },
            {
              value: 'PARTIALLY_COVERED',
              label: 'Partially covered',
              labelVi: 'Chỉ đầy đủ một phần',
            },
            {
              value: 'NOT_AT_ALL_COVERED',
              label: 'Not at all covered',
              labelVi: 'Không đầy đủ',
            },
          ],
        },
        {
          questionText: "Teacher's response to student's questions in class",
          questionTextVi:
            'Phản hồi của giảng viên đối với câu hỏi của sinh viên trong lớp',
          questionType: QuestionType.MULTIPLE_CHOICE,
          questionOrder: 3,
          isActive: true,
          options: [
            {
              value: 'ANSWERED_IMMEDIATELY',
              label: 'Answered immediately or just after the session',
              labelVi: 'Trả lời ngay hoặc tại lúc học',
            },
            {
              value: 'ANSWERED_NEXT_SESSION',
              label: 'Answered in the next session',
              labelVi: 'Trả lời vào buổi học kế tiếp',
            },
            {
              value: 'SOME_UNANSWERED',
              label: 'Some questions left unanswered',
              labelVi: 'Một số câu hỏi không được trả lời',
            },
            {
              value: 'MOST_UNANSWERED',
              label: 'Most queries left unanswered',
              labelVi: 'Phần lớn câu hỏi không được trả lời',
            },
          ],
        },
        {
          questionText:
            'Support from the teacher - guidance for practical exercises, answering questions outside of class',
          questionTextVi:
            'Sự hỗ trợ từ giảng viên - hướng dẫn bài tập thực hành, trả lời câu hỏi ngoài giờ học',
          questionType: QuestionType.MULTIPLE_CHOICE,
          questionOrder: 4,
          isActive: true,
          options: [
            {
              value: 'VERY_GOOD',
              label: 'Very good',
              labelVi: 'Tốt',
            },
            {
              value: 'GOOD',
              label: 'Good',
              labelVi: 'Khá',
            },
            {
              value: 'AVERAGE',
              label: 'Average',
              labelVi: 'Trung bình',
            },
            {
              value: 'POOR',
              label: 'Poor',
              labelVi: 'Kém',
            },
          ],
        },
      ];

      await feedbackQuestionRepo.save(questions);
    } else {
      console.log(
        '   - Feedback questions exist. Updating translations if necessary...',
      );
      const updates = [
        {
          questionOrder: 1,
          questionTextVi: 'Về sự đúng giờ của giảng viên',
        },
        {
          questionOrder: 2,
          questionTextVi:
            'Giảng viên giảng dạy đầy đủ các chủ đề theo yêu cầu của đề cương môn học',
        },
        {
          questionOrder: 3,
          questionTextVi:
            'Phản hồi của giảng viên đối với câu hỏi của sinh viên trong lớp',
        },
        {
          questionOrder: 4,
          questionTextVi:
            'Sự hỗ trợ từ giảng viên - hướng dẫn bài tập thực hành, trả lời câu hỏi ngoài giờ học',
        },
      ];

      for (const update of updates) {
        await feedbackQuestionRepo.update(
          { questionOrder: update.questionOrder },
          { questionTextVi: update.questionTextVi },
        );
      }
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
};

void seed();
