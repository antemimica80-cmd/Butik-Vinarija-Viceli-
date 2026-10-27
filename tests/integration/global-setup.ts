import { execSync } from "node:child_process";
import "../../scripts/env";

/** Rebuilds the test database (TEST_DATABASE_URL) from migrations + seed before integration tests. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn("TEST_DATABASE_URL not set — integration tests will be skipped.");
    return;
  }
  const env = { ...process.env, DATABASE_URL: url, NODE_ENV: "test" } as NodeJS.ProcessEnv;
  execSync("npx tsx scripts/migrate.ts --reset", { env, stdio: "inherit" });
  execSync("npx tsx scripts/seed.ts --demo-users", { env, stdio: "inherit" });
}
