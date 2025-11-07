import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkClassSessionAndTeacher1762513072965 implements MigrationInterface {
    name = 'LinkClassSessionAndTeacher1762513072965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "floor" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "class_session" ADD CONSTRAINT "FK_5e78da528214f67d601e1fc9020" FOREIGN KEY ("teacher_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_session" DROP CONSTRAINT "FK_5e78da528214f67d601e1fc9020"`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "floor" SET DEFAULT '0'`);
    }

}
