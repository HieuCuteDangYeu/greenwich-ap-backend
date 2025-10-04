import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { Course } from '../course/entities/course.entity';
import { Student } from '../student/entities/student.entity';

describe('ClassController', () => {
  let controller: ClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [
        ClassService,
        { provide: getRepositoryToken(Class), useClass: Repository },
        { provide: getRepositoryToken(ClassCourse), useClass: Repository },
        { provide: getRepositoryToken(ClassSession), useClass: Repository },
        { provide: getRepositoryToken(Course), useClass: Repository },
        { provide: getRepositoryToken(Student), useClass: Repository },
      ],
    }).compile();

    controller = module.get<ClassController>(ClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
