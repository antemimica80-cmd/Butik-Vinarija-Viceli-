import { execSync } from "node:child_process";
import "../../scripts/env";

export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://atlas:atlas@localhost:5432/atlas_test";
  const env = { ...process.env, DATABASE_URL: url, NODE_ENV: "test" } as NodeJS.ProcessEnv;
  execSync("npx tsx scripts/migrate.ts --reset", { env, stdio: "inherit" });
  execSync("npx tsx scripts/seed.ts --demo-users", { env, stdio: "inherit" });
}
