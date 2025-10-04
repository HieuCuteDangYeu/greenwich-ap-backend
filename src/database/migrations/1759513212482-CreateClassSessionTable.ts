import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassSessionTable1759513212482
  implements MigrationInterface
{
  name = 'CreateClassSessionTable1759513212482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "class_session" ("id" BIGSERIAL NOT NULL, "class_id" bigint NOT NULL, "course_id" bigint NOT NULL, "date_on" date NOT NULL, "room_id" bigint NOT NULL, "teacher_id" bigint NOT NULL, "status" "public"."class_session_status_enum" NOT NULL DEFAULT 'SCHEDULED', CONSTRAINT "PK_a3d6e3f59db21b19a3b6eb908d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_session" ADD CONSTRAINT "FK_d311babdafa3f4831b808e3643b" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_session" ADD CONSTRAINT "FK_60d19acfb6d4ffcd3987c1bfd34" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_session" DROP CONSTRAINT "FK_60d19acfb6d4ffcd3987c1bfd34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_session" DROP CONSTRAINT "FK_d311babdafa3f4831b808e3643b"`,
    );
    await queryRunner.query(`DROP TABLE "class_session"`);
  }
}
