import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoomTables1762268055090 implements MigrationInterface {
  name = 'UpdateRoomTables1762268055090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "room" ADD "floor" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "floor"`);
  }
}
