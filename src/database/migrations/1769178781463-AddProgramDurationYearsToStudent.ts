import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProgramDurationYearsToStudent1769178781463
  implements MigrationInterface
{
  name = 'AddProgramDurationYearsToStudent1769178781463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" ADD "program_duration_years" integer NOT NULL DEFAULT '4'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" DROP COLUMN "program_duration_years"`,
    );
  }
}
