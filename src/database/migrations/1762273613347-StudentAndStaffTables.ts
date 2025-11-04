import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentAndStaffTables1762273613347 implements MigrationInterface {
  name = 'StudentAndStaffTables1762273613347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" RENAME COLUMN "startYear" TO "currentYear"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD "faculty" character varying(150) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "faculty"`);
    await queryRunner.query(
      `ALTER TABLE "student" RENAME COLUMN "currentYear" TO "startYear"`,
    );
  }
}
