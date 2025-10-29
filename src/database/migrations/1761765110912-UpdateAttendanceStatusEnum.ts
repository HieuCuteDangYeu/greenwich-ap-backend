import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttendanceStatusEnum1761765110912
  implements MigrationInterface
{
  name = 'UpdateAttendanceStatusEnum1761765110912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing records: map LATE and EXCUSED to appropriate statuses
    // LATE -> PRESENT (they were present, just late)
    // EXCUSED -> ABSENT (they were not present, but excused)
    await queryRunner.query(
      `UPDATE "attendance" SET "status" = 'PRESENT' WHERE "status" = 'LATE'`,
    );
    await queryRunner.query(
      `UPDATE "attendance" SET "status" = 'ABSENT' WHERE "status" = 'EXCUSED'`,
    );

    // Alter the enum type by creating a new one and switching to it
    await queryRunner.query(
      `ALTER TYPE "public"."attendance_status_enum" RENAME TO "attendance_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'PENDING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" TYPE "public"."attendance_status_enum" USING "status"::text::"public"."attendance_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."attendance_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old enum (data will be lost for PENDING status)
    await queryRunner.query(
      `UPDATE "attendance" SET "status" = 'PRESENT' WHERE "status" = 'PENDING'`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."attendance_status_enum" RENAME TO "attendance_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" TYPE "public"."attendance_status_enum" USING "status"::text::"public"."attendance_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'PRESENT'`,
    );
    await queryRunner.query(`DROP TYPE "public"."attendance_status_enum_old"`);
  }
}
