import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class FeedbackTables1761983815641 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create feedback_question table
    await queryRunner.createTable(
      new Table({
        name: 'feedback_question',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'question_text',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'question_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'MULTIPLE_CHOICE'",
            comment: 'Type: MULTIPLE_CHOICE, RATING, YES_NO, TEXT',
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: false,
            comment: 'Array of available options for the question',
          },
          {
            name: 'question_order',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create feedback_response table
    await queryRunner.createTable(
      new Table({
        name: 'feedback_response',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'student_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'staff_id',
            type: 'bigint',
            isNullable: false,
            comment: 'Teacher being evaluated',
          },
          {
            name: 'course_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'term_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'question_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'selected_option',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment:
              'Selected option value (validated against question options)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create feedback_submission table to track complete submissions
    await queryRunner.createTable(
      new Table({
        name: 'feedback_submission',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'student_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'staff_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'course_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'term_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Remarks / Suggestions for improvement',
          },
          {
            name: 'submitted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for feedback_response
    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'student',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['course_id'],
        referencedTableName: 'course',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['class_id'],
        referencedTableName: 'class',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['term_id'],
        referencedTableName: 'term',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_response',
      new TableForeignKey({
        columnNames: ['question_id'],
        referencedTableName: 'feedback_question',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign keys for feedback_submission
    await queryRunner.createForeignKey(
      'feedback_submission',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'student',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_submission',
      new TableForeignKey({
        columnNames: ['staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_submission',
      new TableForeignKey({
        columnNames: ['course_id'],
        referencedTableName: 'course',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_submission',
      new TableForeignKey({
        columnNames: ['class_id'],
        referencedTableName: 'class',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feedback_submission',
      new TableForeignKey({
        columnNames: ['term_id'],
        referencedTableName: 'term',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint to prevent duplicate submissions
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_feedback_submission_unique" ON "feedback_submission" ("student_id", "staff_id", "course_id", "term_id")`,
    );

    // Add index for efficient querying
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_response_student_staff_course" ON "feedback_response" ("student_id", "staff_id", "course_id", "term_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_feedback_response_student_staff_course"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_feedback_submission_unique"`);

    // Drop feedback_submission table (will auto-drop its foreign keys)
    await queryRunner.dropTable('feedback_submission', true);

    // Drop feedback_response table (will auto-drop its foreign keys)
    await queryRunner.dropTable('feedback_response', true);

    // Drop feedback_question table
    await queryRunner.dropTable('feedback_question', true);
  }
}
