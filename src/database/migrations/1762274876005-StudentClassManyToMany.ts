import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentClassManyToMany1762274876005 implements MigrationInterface {
  name = 'StudentClassManyToMany1762274876005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_85874ee23f2927b59ff5f769f3c"`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_class" ("student_id" bigint NOT NULL, "class_id" bigint NOT NULL, CONSTRAINT "PK_629f82c737f62ddd839c7853eae" PRIMARY KEY ("student_id", "class_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9555c999c98a9447139a424921" ON "student_class" ("student_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3bd8bcc332c16601f9e644208d" ON "student_class" ("class_id") `,
    );
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "class_id"`);
    await queryRunner.query(
      `ALTER TABLE "student_class" ADD CONSTRAINT "FK_9555c999c98a9447139a4249216" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_class" ADD CONSTRAINT "FK_3bd8bcc332c16601f9e644208dd" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student_class" DROP CONSTRAINT "FK_3bd8bcc332c16601f9e644208dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_class" DROP CONSTRAINT "FK_9555c999c98a9447139a4249216"`,
    );
    await queryRunner.query(`ALTER TABLE "student" ADD "class_id" bigint`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3bd8bcc332c16601f9e644208d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9555c999c98a9447139a424921"`,
    );
    await queryRunner.query(`DROP TABLE "student_class"`);
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_85874ee23f2927b59ff5f769f3c" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
