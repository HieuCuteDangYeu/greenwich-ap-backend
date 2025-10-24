import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableFields1761198382035 implements MigrationInterface {
  name = 'UpdateTableFields1761198382035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_dca07fba91b82def10e2c752faf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP COLUMN "academic_year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "year" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD "term" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" ADD "full_name" character varying(80)`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "enrolment_day" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "faculty" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" DROP CONSTRAINT "FK_d8caf78eed2d2792f98c3e3c879"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" ALTER COLUMN "campus_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_dca07fba91b82def10e2c752faf" FOREIGN KEY ("mentor_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" ADD CONSTRAINT "FK_d8caf78eed2d2792f98c3e3c879" FOREIGN KEY ("campus_id") REFERENCES "campus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_account" DROP CONSTRAINT "FK_d8caf78eed2d2792f98c3e3c879"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_dca07fba91b82def10e2c752faf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" ALTER COLUMN "campus_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" ADD CONSTRAINT "FK_d8caf78eed2d2792f98c3e3c879" FOREIGN KEY ("campus_id") REFERENCES "campus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "faculty" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ALTER COLUMN "enrolment_day" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_account" DROP COLUMN "full_name"`,
    );
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "term"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "year"`);
    await queryRunner.query(
      `ALTER TABLE "student" ADD "academic_year" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_dca07fba91b82def10e2c752faf" FOREIGN KEY ("mentor_id") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
