/**
 * Create or update a user (e.g. the first administrator).
 *   npm run user:create -- --email=you@example.com --role=admin --name="Your Name"
 * The password is read from the ATLAS_PASSWORD environment variable or generated and printed once.
 */
import "./env";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { hashPassword } from "../src/lib/password";

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const email = arg("email")?.toLowerCase();
const role = arg("role") ?? "visitor";
const name = arg("name") ?? null;
if (!email || !["visitor", "owner", "editor", "admin"].includes(role)) { console.error("Usage: --email=... --role=visitor|owner|editor|admin [--name=...]"); process.exit(1); }
const password = process.env.ATLAS_PASSWORD || randomBytes(12).toString("base64url");
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
(async () => {
  await sql`insert into users (email, name, role, password_hash, email_verified_at) values (${email}, ${name}, ${role}, ${await hashPassword(password)}, now())
    on conflict (lower(email)) do update set role = excluded.role, password_hash = excluded.password_hash`;
  console.log(`User ${email} (${role}) saved.${process.env.ATLAS_PASSWORD ? "" : ` Generated password: ${password}`}`);
})().finally(() => sql.end());
