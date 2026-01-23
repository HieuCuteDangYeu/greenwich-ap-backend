import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClassService } from './class.service';
import { Class } from './entities/class.entity';
import { ClassCourse } from './entities/class-course.entity';
import { ClassSession } from './entities/class-session.entity';
import { Course } from '../course/entities/course.entity';
import { Student } from '../student/entities/student.entity';
import { Room } from '../room/entities/room.entity';
import { Staff } from '../staff/entities/staff.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { StudentService } from '../student/student.service';

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
        { provide: getRepositoryToken(Room), useClass: Repository },
        { provide: getRepositoryToken(Staff), useClass: Repository },
        { provide: AttendanceService, useValue: {} },
        { provide: StudentService, useValue: {} },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClassService>(ClassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
