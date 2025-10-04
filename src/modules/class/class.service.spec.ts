import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassService } from './class.service';
import { Class } from './entities/class.entity';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { Course } from '../course/entities/course.entity';
import { Student } from '../student/entities/student.entity';

describe('ClassService', () => {
  let service: ClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        { provide: getRepositoryToken(Class), useClass: Repository },
        { provide: getRepositoryToken(ClassCourse), useClass: Repository },
        { provide: getRepositoryToken(ClassSession), useClass: Repository },
        { provide: getRepositoryToken(Course), useClass: Repository },
        { provide: getRepositoryToken(Student), useClass: Repository },
      ],
    }).compile();

    service = module.get<ClassService>(ClassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
