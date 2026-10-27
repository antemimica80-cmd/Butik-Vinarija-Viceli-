import { sql } from "./db";

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | number | null,
  diff?: unknown,
) {
  await sql`insert into audit_log (actor_user_id, action, entity_type, entity_id, diff)
    values (${actorId}, ${action}, ${entityType}, ${entityId == null ? null : String(entityId)},
            ${diff === undefined ? null : sql.json(diff as never)})`;
}
