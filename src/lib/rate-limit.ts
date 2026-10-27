import { sql } from "./db";

/**
 * Sliding-window rate limit stored in Postgres so it works across server instances.
 * Returns true when the action is allowed (and records it).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from rate_limit_events
    where key = ${key} and created_at > now() - make_interval(secs => ${windowSeconds})`;
  if (count >= limit) return false;
  await sql`insert into rate_limit_events (key) values (${key})`;
  if (Math.random() < 0.02) {
    await sql`delete from rate_limit_events where created_at < now() - interval '2 days'`;
  }
  return true;
}
