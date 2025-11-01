import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropThreadTaggedUsers1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(`
      ALTER TABLE "thread_tagged_users" DROP CONSTRAINT IF EXISTS "FK_119729d11176bfb9ff5d6a6800e";
    `);
    await queryRunner.query(`
      ALTER TABLE "thread_tagged_users" DROP CONSTRAINT IF EXISTS "FK_817406c77a219a1d33056af0133";
    `);

    // Drop indexes (if they exist)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_119729d11176bfb9ff5d6a6800";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_817406c77a219a1d33056af013";
    `);

    // Drop the table itself
    await queryRunner.query(`DROP TABLE IF EXISTS "thread_tagged_users";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "thread_tagged_users" (
        "threadsId" integer NOT NULL,
        "userAccountId" bigint NOT NULL,
        CONSTRAINT "PK_4a2176937f9c9d78b8975035250" PRIMARY KEY ("threadsId", "userAccountId")
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_119729d11176bfb9ff5d6a6800" ON "thread_tagged_users" ("threadsId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_817406c77a219a1d33056af013" ON "thread_tagged_users" ("userAccountId");
    `);
    await queryRunner.query(`
      ALTER TABLE "thread_tagged_users"
      ADD CONSTRAINT "FK_119729d11176bfb9ff5d6a6800e" FOREIGN KEY ("threadsId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "thread_tagged_users"
      ADD CONSTRAINT "FK_817406c77a219a1d33056af0133" FOREIGN KEY ("userAccountId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }
}
