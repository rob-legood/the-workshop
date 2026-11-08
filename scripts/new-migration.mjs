// Creates migrations/NNNN_<name>.sql containing the SQL needed to bring the
// database from the current migrations up to prisma/schema.prisma.
//
//   npm run db:migration -- add_room_column
//
// It replays migrations/*.sql into a throwaway SQLite file and asks Prisma to
// diff that against the schema, so it never touches your local D1 data.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MIGRATIONS_DIR = "migrations";
const name = process.argv[2];

if (!name || !/^[a-z0-9_]+$/.test(name)) {
  console.error("Usage: npm run db:migration -- <name>   (lowercase letters, digits, underscores)");
  process.exit(1);
}

const existing = readdirSync(MIGRATIONS_DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();

const tmp = mkdtempSync(join(tmpdir(), "workshop-migration-"));
const dbPath = join(tmp, "baseline.db");

try {
  const db = new DatabaseSync(dbPath);
  for (const file of existing) {
    db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  db.close();

  const sql = execFileSync(
    "npx",
    ["prisma", "migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--script"],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
      env: { ...process.env, DATABASE_URL: `file:${dbPath.replaceAll("\\", "/")}` },
      stdio: ["ignore", "pipe", "inherit"],
    }
  );

  if (!sql.trim() || sql.includes("This is an empty migration")) {
    console.log("No schema changes found; no migration created.");
    process.exit(0);
  }

  const next = String(existing.length + 1).padStart(4, "0");
  const file = join(MIGRATIONS_DIR, `${next}_${name}.sql`);
  writeFileSync(file, sql);
  console.log(`Created ${file}. Review it, then run: npm run db:migrate`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
