import { importContent } from "@job-prep/store";

/**
 * CLI: project the git-tracked `topics/` content into Postgres.
 *
 *   DATABASE_URL=... npm run db:import
 *
 * Reads DATABASE_URL (required) and TOPICS_DIR (default "topics"), runs the
 * idempotent import, and prints how many topics were imported vs unchanged.
 */
async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Set it to your Postgres connection string, e.g.\n" +
        "  DATABASE_URL=postgres://jobprep:jobprep@localhost:5432/jobprep npm run db:import",
    );
    process.exit(1);
  }

  const topicsDir = process.env.TOPICS_DIR ?? "topics";
  const { imported, unchanged } = await importContent(url, topicsDir);
  console.log(`Content import complete: ${imported} imported, ${unchanged} unchanged.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
