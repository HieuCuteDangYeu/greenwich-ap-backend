import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTermAndStudentFields1769165230141
  implements MigrationInterface
{
  name = 'UpdateTermAndStudentFields1769165230141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "term" DROP COLUMN "academic_year"`);
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "currentYear" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "startTerm" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "endTerm" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "endTerm" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "startTerm" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "currentYear" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "term" ADD "academic_year" character varying(20)`,
    );
  }
}
