import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionTextViToFeedbackQuestion1762196824337
  implements MigrationInterface
{
  name = 'AddQuestionTextViToFeedbackQuestion1762196824337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_1d013f0ada9fa706ad44bcfa189"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_815991923b66991ed71327e641f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_ed073a86454ad904ef53a081201"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_e15a45674c085e59b475efdda4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_c83970a9c2abcff815e737effcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_a8939a51452b90f0721ef09e990"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_6cec79c6c80ce8d4c79e349a04d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_78dd6ad092f0b825da41954001c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_8484db5ba975cee156f8542d9e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_87d1e4bdd06a89a0ba6875653e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_312924596095960b6dd6a2c6e4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_a56b50ce467430ee417e5dce0f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_feedback_submission_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_feedback_response_student_staff_course"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "UQ_1d013f0ada9fa706ad44bcfa189"`,
    );
    await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "roleStaffId"`);
    await queryRunner.query(
      `ALTER TABLE "feedback_question" ADD "question_text_vi" character varying(500)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_submission"."notes" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ALTER COLUMN "submitted_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_question"."question_type" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_question"."options" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_question" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_question" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_response"."staff_id" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_response"."selected_option" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_a8939a51452b90f0721ef09e990" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_c83970a9c2abcff815e737effcf" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_e15a45674c085e59b475efdda4d" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_ed073a86454ad904ef53a081201" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_815991923b66991ed71327e641f" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_a56b50ce467430ee417e5dce0f3" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_312924596095960b6dd6a2c6e4d" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_87d1e4bdd06a89a0ba6875653e7" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_8484db5ba975cee156f8542d9e0" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_78dd6ad092f0b825da41954001c" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_6cec79c6c80ce8d4c79e349a04d" FOREIGN KEY ("question_id") REFERENCES "feedback_question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_6cec79c6c80ce8d4c79e349a04d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_78dd6ad092f0b825da41954001c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_8484db5ba975cee156f8542d9e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_87d1e4bdd06a89a0ba6875653e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_312924596095960b6dd6a2c6e4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" DROP CONSTRAINT "FK_a56b50ce467430ee417e5dce0f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_815991923b66991ed71327e641f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_ed073a86454ad904ef53a081201"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_e15a45674c085e59b475efdda4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_c83970a9c2abcff815e737effcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" DROP CONSTRAINT "FK_a8939a51452b90f0721ef09e990"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_response"."selected_option" IS 'Selected option value (validated against question options)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_response"."staff_id" IS 'Teacher being evaluated'`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_question" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_question" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_question"."options" IS 'Array of available options for the question'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_question"."question_type" IS 'Type: MULTIPLE_CHOICE, RATING, YES_NO, TEXT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ALTER COLUMN "submitted_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "feedback_submission"."notes" IS 'Remarks / Suggestions for improvement'`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_question" DROP COLUMN "question_text_vi"`,
    );
    await queryRunner.query(`ALTER TABLE "staff" ADD "roleStaffId" bigint`);
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "UQ_1d013f0ada9fa706ad44bcfa189" UNIQUE ("roleStaffId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_response_student_staff_course" ON "feedback_response" ("student_id", "staff_id", "course_id", "term_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_feedback_submission_unique" ON "feedback_submission" ("student_id", "staff_id", "course_id", "term_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_a56b50ce467430ee417e5dce0f3" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_312924596095960b6dd6a2c6e4d" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_87d1e4bdd06a89a0ba6875653e7" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_8484db5ba975cee156f8542d9e0" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_78dd6ad092f0b825da41954001c" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_response" ADD CONSTRAINT "FK_6cec79c6c80ce8d4c79e349a04d" FOREIGN KEY ("question_id") REFERENCES "feedback_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_a8939a51452b90f0721ef09e990" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_c83970a9c2abcff815e737effcf" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_e15a45674c085e59b475efdda4d" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_ed073a86454ad904ef53a081201" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_submission" ADD CONSTRAINT "FK_815991923b66991ed71327e641f" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_1d013f0ada9fa706ad44bcfa189" FOREIGN KEY ("roleStaffId") REFERENCES "staff_role"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
