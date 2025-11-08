import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCourseTable1762571700847 implements MigrationInterface {
  name = 'UpdateCourseTable1762571700847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_f4acb7f54962af04a558b1a5ed9" FOREIGN KEY ("teacher_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_f4acb7f54962af04a558b1a5ed9"`,
    );
  }
}
