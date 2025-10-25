import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudentTable1761380521482 implements MigrationInterface {
  name = 'UpdateStudentTable1761380521482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "year"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "term"`);
    await queryRunner.query(
      `ALTER TABLE "student" ADD "startYear" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "endYear" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "startTerm" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "endTerm" character varying(20) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "endTerm"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "startTerm"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "endYear"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "startYear"`);
    await queryRunner.query(
      `ALTER TABLE "student" ADD "term" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "year" character varying(20) NOT NULL`,
    );
  }
}
