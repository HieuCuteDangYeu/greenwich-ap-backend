import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTimeSlotAndClassSessionRelationship1762514342975
  implements MigrationInterface
{
  name = 'UpdateTimeSlotAndClassSessionRelationship1762514342975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_session" ADD "time_slot_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "room" ALTER COLUMN "floor" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_session" ADD CONSTRAINT "FK_8809d60b752f016c31fecb501e0" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_session" DROP CONSTRAINT "FK_8809d60b752f016c31fecb501e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room" ALTER COLUMN "floor" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_session" DROP COLUMN "time_slot_id"`,
    );
  }
}
