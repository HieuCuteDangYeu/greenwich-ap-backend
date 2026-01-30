import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomBookingAndRescheduleRequest1769793260091 implements MigrationInterface {
    name = 'AddRoomBookingAndRescheduleRequest1769793260091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room_booking_slot" ("id" BIGSERIAL NOT NULL, "booking_id" bigint NOT NULL, "time_slot_id" integer NOT NULL, "room_id" bigint NOT NULL, "date_on" date NOT NULL, CONSTRAINT "UQ_08af9af8b2d8e9fda25e33cbab5" UNIQUE ("booking_id", "time_slot_id"), CONSTRAINT "PK_1508cb35b8da049aa1d7fa0d702" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_76a20af56d88e70bebe185af03" ON "room_booking_slot" ("room_id", "date_on", "time_slot_id") `);
        await queryRunner.query(`CREATE TYPE "public"."reschedule_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "reschedule_request" ("id" BIGSERIAL NOT NULL, "session_id" bigint NOT NULL, "requested_by_teacher_id" bigint NOT NULL, "new_date_on" date NOT NULL, "new_time_slot_id" integer NOT NULL, "new_room_id" bigint NOT NULL, "reason" text, "status" "public"."reschedule_request_status_enum" NOT NULL DEFAULT 'PENDING', "reviewed_by_staff_id" bigint, "review_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b78b430b2c16b3a4d328fdfd6d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."room_booking_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "room_booking" ("id" BIGSERIAL NOT NULL, "room_id" bigint NOT NULL, "requester_user_id" bigint NOT NULL, "date_on" date NOT NULL, "purpose" character varying(255), "status" "public"."room_booking_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_37af696e6aeb3fcb059778a96ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0c4fbf8a40fd40f65427300977" ON "class_session" ("room_id", "date_on", "time_slot_id") `);
        await queryRunner.query(`ALTER TABLE "room_booking_slot" ADD CONSTRAINT "FK_20450ac124c0f78bdede62a64b8" FOREIGN KEY ("booking_id") REFERENCES "room_booking"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_booking_slot" ADD CONSTRAINT "FK_2486280a4348908454c0c205f90" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_ccc022172620918bdb1406d40a9" FOREIGN KEY ("session_id") REFERENCES "class_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_249d134ec5a1ed3876dba4b568b" FOREIGN KEY ("requested_by_teacher_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_672805f759721e785348b232281" FOREIGN KEY ("new_time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_8bf326e77f52480276d9a1ccbc1" FOREIGN KEY ("new_room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_8b9a899b063dfe6966cf65b852d" FOREIGN KEY ("reviewed_by_staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_booking" ADD CONSTRAINT "FK_fa30cbd7fa3588d5f8699503779" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_booking" ADD CONSTRAINT "FK_973dc977ac4c5b15ca49959fa94" FOREIGN KEY ("requester_user_id") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_booking" DROP CONSTRAINT "FK_973dc977ac4c5b15ca49959fa94"`);
        await queryRunner.query(`ALTER TABLE "room_booking" DROP CONSTRAINT "FK_fa30cbd7fa3588d5f8699503779"`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_8b9a899b063dfe6966cf65b852d"`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_8bf326e77f52480276d9a1ccbc1"`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_672805f759721e785348b232281"`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_249d134ec5a1ed3876dba4b568b"`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_ccc022172620918bdb1406d40a9"`);
        await queryRunner.query(`ALTER TABLE "room_booking_slot" DROP CONSTRAINT "FK_2486280a4348908454c0c205f90"`);
        await queryRunner.query(`ALTER TABLE "room_booking_slot" DROP CONSTRAINT "FK_20450ac124c0f78bdede62a64b8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c4fbf8a40fd40f65427300977"`);
        await queryRunner.query(`DROP TABLE "room_booking"`);
        await queryRunner.query(`DROP TYPE "public"."room_booking_status_enum"`);
        await queryRunner.query(`DROP TABLE "reschedule_request"`);
        await queryRunner.query(`DROP TYPE "public"."reschedule_request_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76a20af56d88e70bebe185af03"`);
        await queryRunner.query(`DROP TABLE "room_booking_slot"`);
    }

}
