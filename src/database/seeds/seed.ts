import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Admin } from '../../modules/admin/entities/admin.entity';
import {
  FeedbackQuestion,
  QuestionType,
} from '../../modules/feedback/entities/feedback-question.entity';
import { Campus } from '../../modules/user/entities/campus.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { User } from '../../modules/user/entities/user.entity';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let config: DataSourceOptions;

if (isProduction) {
  config = {
    type: 'postgres',
    url: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    entities: [path.join(__dirname, '../../modules/**/*.entity.js')],
    synchronize: false,
    logging: false, // Changed to false for a truly silent script
  };
} else {
  config = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [path.join(__dirname, '../../modules/**/*.entity.{ts,js}')],
    synchronize: false,
    logging: false, // Changed to false for a truly silent script
  };
}

const AppDataSource = new DataSource(config);

export const seed = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Starting database seeding...\n');

    const campusRepo = AppDataSource.getRepository(Campus);
    const campusData = [
      { code: 'HCM', name: 'Ho Chi Minh' },
      { code: 'HN', name: 'Ha Noi' },
      { code: 'DN', name: 'Da Nang' },
      { code: 'CT', name: 'Can Tho' },
    ];

    let campusCount = 0;
    for (const campus of campusData) {
      const exists = await campusRepo.findOne({ where: { code: campus.code } });
      if (!exists) {
        await campusRepo.save(campus);
        campusCount++;
      }
    }
    if (campusCount > 0) {
      console.log(`✓ Seeded ${campusCount} campuses`);
    } else {
      console.log('✓ Campuses already seeded, skipping...');
    }

    const roleRepo = AppDataSource.getRepository(Role);
    const roleData = [
      { name: 'Admin' },
      { name: 'Student' },
      { name: 'Staff' },
      { name: 'Guardian' },
    ];

    let roleCount = 0;
    for (const role of roleData) {
      const exists = await roleRepo.findOne({ where: { name: role.name } });
      if (!exists) {
        await roleRepo.save(role);
        roleCount++;
      }
    }
    if (roleCount > 0) {
      console.log(`✓ Seeded ${roleCount} roles`);
    } else {
      console.log('✓ Roles already seeded, skipping...');
    }

    const userRepo = AppDataSource.getRepository(User);
    const adminRepo = AppDataSource.getRepository(Admin);
    const adminEmail = 'admin@greenwich.edu';
    const adminPassword = 'secret';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminRole = await roleRepo.findOne({ where: { name: 'Admin' } });
    const hcmCampus = await campusRepo.findOne({ where: { code: 'HCM' } });

    if (!adminRole || !hcmCampus) {
      throw new Error(
        'Admin role or Ho Chi Minh campus not found. Please ensure previous seeding completed successfully.',
      );
    }

    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminUser = await userRepo.save({
        email: adminEmail,
        roleId: adminRole.id,
        campusId: hcmCampus.id,
      });

      // Create admin record with password
      await adminRepo.save({
        userId: adminUser.id,
        password: hashedPassword,
      });
      console.log(`✓ Created admin user: ${adminEmail}`);
    } else {
      console.log('✓ Admin user already exists, skipping...');
    }

    // Seed feedback questions
    const feedbackQuestionRepo = AppDataSource.getRepository(FeedbackQuestion);
    const existingQuestionsCount = await feedbackQuestionRepo.count();

    if (existingQuestionsCount === 0) {
      const questions = [
        {
          questionText: "Regarding the teacher's punctuality",
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
            'Support from the teacher - guidance for practical exercises, answering questions and side of class',
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
      console.log(`✓ Seeded ${questions.length} feedback questions`);
    } else {
      console.log('✓ Feedback questions already seeded, skipping...');
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

void seed();
