import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { Repository } from 'typeorm';
import { AddCourseDto } from './dto/add-course.dto';
import { ClassCourse } from './entities/class-course.entity';
import { Course } from '../course/entities/course.entity';
import { Student } from '../student/entities/student.entity';
import { ClassSession } from './entities/class-session.entity';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassCourse)
    private readonly classCourseRepository: Repository<ClassCourse>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  create(createClassDto: CreateClassDto) {
    const newClass = this.classRepository.create(createClassDto);
    return this.classRepository.save(newClass);
  }

  async createSession(
    classId: number,
    createSessionDto: CreateClassSessionDto,
  ) {
    const classEntity = await this.findOne(classId);

    const course = await this.courseRepository.findOne({
      where: { id: createSessionDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createSessionDto.courseId} not found`,
      );
    }

    const classCourse = await this.classCourseRepository.findOne({
      where: { class: { id: classEntity.id }, course: { id: course.id } },
    });

    if (!classCourse) {
      throw new BadRequestException(
        `Course with ID ${course.id} is not assigned to class with ID ${classEntity.id}`,
      );
    }

    const newSession = this.classSessionRepository.create({
      class: classEntity,
      course,
      courseId: course.id,
      classId: classEntity.id,
      dateOn: new Date(createSessionDto.dateOn),
      roomId: createSessionDto.roomId,
      teacherId: createSessionDto.teacherId,
      status: createSessionDto.status ?? 'SCHEDULED',
    });

    return this.classSessionRepository.save(newSession);
  }

  findSessions(classId: number) {
    return this.classSessionRepository.find({
      where: { class: { id: classId } },
      relations: ['course'],
      order: { dateOn: 'ASC' },
    });
  }

  async findSession(classId: number, sessionId: number) {
    const session = await this.classSessionRepository.findOne({
      where: { id: sessionId, class: { id: classId } },
      relations: ['course', 'class'],
    });

    if (!session) {
      throw new NotFoundException(
        `Session with ID ${sessionId} not found for class ${classId}`,
      );
    }

    return session;
  }

  async updateSession(
    classId: number,
    sessionId: number,
    updateDto: UpdateClassSessionDto,
  ) {
    const session = await this.findSession(classId, sessionId);

    if (updateDto.courseId !== undefined) {
      const course = await this.courseRepository.findOne({
        where: { id: updateDto.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          `Course with ID ${updateDto.courseId} not found`,
        );
      }

      const classCourse = await this.classCourseRepository.findOne({
        where: { class: { id: classId }, course: { id: course.id } },
      });
      if (!classCourse) {
        throw new BadRequestException(
          `Course with ID ${course.id} is not assigned to class with ID ${classId}`,
        );
      }

      session.course = course;
      session.courseId = course.id;
    }

    if (updateDto.dateOn !== undefined) {
      session.dateOn = new Date(updateDto.dateOn);
    }
    if (updateDto.roomId !== undefined) {
      session.roomId = updateDto.roomId;
    }
    if (updateDto.teacherId !== undefined) {
      session.teacherId = updateDto.teacherId;
    }
    if (updateDto.status !== undefined) {
      session.status = updateDto.status;
    }

    return this.classSessionRepository.save(session);
  }

  async removeSession(classId: number, sessionId: number) {
    const session = await this.findSession(classId, sessionId);
    await this.classSessionRepository.remove(session);
    return { deleted: true };
  }

  findAll() {
    return this.classRepository.find();
  }

  async findOne(id: number, relations: string[] = []) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations,
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    await this.classRepository.update(id, updateClassDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.classRepository.delete(id);
  }

  async addCourse(id: number, addCourseDto: AddCourseDto) {
    const classEntity = await this.findOne(id);

    const course = await this.courseRepository.findOneBy({
      id: addCourseDto.courseId,
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${addCourseDto.courseId} not found`,
      );
    }

    const newClassCourse = this.classCourseRepository.create({
      class: classEntity,
      course: course,
      note: addCourseDto.note,
    });

    return this.classCourseRepository.save(newClassCourse);
  }

  async removeCourse(id: number, courseId: number) {
    const classCourse = await this.classCourseRepository.findOne({
      where: { class: { id }, course: { id: courseId } },
    });

    if (!classCourse) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in class with ID ${id}`,
      );
    }

    return this.classCourseRepository.remove(classCourse);
  }

  async findStudentsByClass(id: number) {
    const classEntity = await this.findOne(id);
    return this.studentRepository.find({
      where: { class: { id: classEntity.id } },
    });
  }

  async findCoursesByClass(id: number) {
    const classCourses = await this.classCourseRepository.find({
      where: { class: { id } },
      relations: ['course'],
    });
    return classCourses.map((cc) => cc.course);
  }
}
