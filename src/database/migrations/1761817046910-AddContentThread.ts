import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentThread1761817046910 implements MigrationInterface {
    name = 'AddContentThread1761817046910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "threads" ADD "content" text NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."attendance_status_enum" RENAME TO "attendance_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" TYPE "public"."attendance_status_enum" USING "status"::"text"::"public"."attendance_status_enum"`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."attendance_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attendance_status_enum_old" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" TYPE "public"."attendance_status_enum_old" USING "status"::"text"::"public"."attendance_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'PRESENT'`);
        await queryRunner.query(`DROP TYPE "public"."attendance_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."attendance_status_enum_old" RENAME TO "attendance_status_enum"`);
        await queryRunner.query(`ALTER TABLE "threads" DROP COLUMN "content"`);
    }

}
