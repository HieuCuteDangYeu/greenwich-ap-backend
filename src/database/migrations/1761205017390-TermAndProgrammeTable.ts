import { MigrationInterface, QueryRunner } from 'typeorm';

export class TermAndProgrammeTable1761205017390 implements MigrationInterface {
  name = 'TermAndProgrammeTable1761205017390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "programme" ("id" BIGSERIAL NOT NULL, "code" character varying(20) NOT NULL, "name" character varying(150) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0cb721fe5a34b811494fb228d98" UNIQUE ("code"), CONSTRAINT "PK_76ff6b30b74f213944d1ac0a660" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "term" ("id" BIGSERIAL NOT NULL, "code" character varying(20) NOT NULL, "name" character varying(150) NOT NULL, "academic_year" character varying(20), "start_date" date, "end_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "programme_id" bigint NOT NULL, CONSTRAINT "UQ_term_programme_code" UNIQUE ("programme_id", "code"), CONSTRAINT "PK_55b0479f0743f2e5d5ec414821e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "term_department" ("term_id" bigint NOT NULL, "department_id" bigint NOT NULL, CONSTRAINT "PK_e2a5eb058b03181e29bf4de32d0" PRIMARY KEY ("term_id", "department_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f6f5e9c983ac59bb406fa43f8" ON "term_department" ("term_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1add8c85b7f4cf3dff781b94ae" ON "term_department" ("department_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "term" ADD CONSTRAINT "FK_c5efa69835c2b5ed11ce54bc63d" FOREIGN KEY ("programme_id") REFERENCES "programme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "term_department" ADD CONSTRAINT "FK_2f6f5e9c983ac59bb406fa43f8b" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "term_department" ADD CONSTRAINT "FK_1add8c85b7f4cf3dff781b94aec" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "term_department" DROP CONSTRAINT "FK_1add8c85b7f4cf3dff781b94aec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "term_department" DROP CONSTRAINT "FK_2f6f5e9c983ac59bb406fa43f8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "term" DROP CONSTRAINT "FK_c5efa69835c2b5ed11ce54bc63d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1add8c85b7f4cf3dff781b94ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f6f5e9c983ac59bb406fa43f8"`,
    );
    await queryRunner.query(`DROP TABLE "term_department"`);
    await queryRunner.query(`DROP TABLE "term"`);
    await queryRunner.query(`DROP TABLE "programme"`);
  }
}
