import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudent1761387770391 implements MigrationInterface {
  name = 'UpdateStudent1761387770391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_dca07fba91b82def10e2c752faf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_admin_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP COLUMN "academic_year"`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_a28028ba709cd7e5053a86857b4" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_a28028ba709cd7e5053a86857b4"`,
    );
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
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "endTerm"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "startTerm"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "endYear"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "startYear"`);
    await queryRunner.query(
      `ALTER TABLE "student" ADD "academic_year" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_admin_user_id" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_dca07fba91b82def10e2c752faf" FOREIGN KEY ("mentor_id") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
