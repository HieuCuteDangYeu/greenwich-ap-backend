import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStuStaGuaTables1761931295246 implements MigrationInterface {
    name = 'UpdateStuStaGuaTables1761931295246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "UQ_9022016ef2693e1d0c92cf7a297"`);
        await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "endYear"`);
        await queryRunner.query(`ALTER TABLE "guardian" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "roleStaffId" bigint`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "UQ_1d013f0ada9fa706ad44bcfa189" UNIQUE ("roleStaffId")`);
        await queryRunner.query(`ALTER TABLE "guardian" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "guardian" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "hire_date"`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "hire_date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "end_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "guardian" ALTER COLUMN "occupation" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "FK_6cc634e8176332de785dc61dac1"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "FK_986f782417afbca26a068d59339"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "UQ_6cc634e8176332de785dc61dac1" UNIQUE ("student_id")`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "UQ_986f782417afbca26a068d59339" UNIQUE ("guardian_id")`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP COLUMN "relationship"`);
        await queryRunner.query(`DROP TYPE "public"."student_guardian_relationship_enum"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD "relationship" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "FK_1d013f0ada9fa706ad44bcfa189" FOREIGN KEY ("roleStaffId") REFERENCES "staff_role"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "FK_6cc634e8176332de785dc61dac1" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "FK_986f782417afbca26a068d59339" FOREIGN KEY ("guardian_id") REFERENCES "guardian"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "FK_986f782417afbca26a068d59339"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "FK_6cc634e8176332de785dc61dac1"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP CONSTRAINT "FK_1d013f0ada9fa706ad44bcfa189"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP COLUMN "relationship"`);
        await queryRunner.query(`CREATE TYPE "public"."student_guardian_relationship_enum" AS ENUM('FATHER', 'MOTHER', 'GUARDIAN', 'RELATIVE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD "relationship" "public"."student_guardian_relationship_enum" NOT NULL DEFAULT 'GUARDIAN'`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "UQ_986f782417afbca26a068d59339"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" DROP CONSTRAINT "UQ_6cc634e8176332de785dc61dac1"`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "FK_986f782417afbca26a068d59339" FOREIGN KEY ("guardian_id") REFERENCES "guardian"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "FK_6cc634e8176332de785dc61dac1" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guardian" ALTER COLUMN "occupation" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "end_date" date`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "hire_date"`);
        await queryRunner.query(`ALTER TABLE "staff" ADD "hire_date" date`);
        await queryRunner.query(`ALTER TABLE "guardian" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "guardian" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP CONSTRAINT "UQ_1d013f0ada9fa706ad44bcfa189"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "roleStaffId"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "guardian" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "student" ADD "endYear" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_guardian" ADD CONSTRAINT "UQ_9022016ef2693e1d0c92cf7a297" UNIQUE ("student_id", "guardian_id")`);
    }

}
