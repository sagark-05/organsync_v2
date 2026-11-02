// Metadata only: no names, dates of birth, contact details, or credentials.
export async function recordMutation(db, entity, recordId, action, actorId = null) {
  const primaryKey = { waiting_list: "waiting_id", organ_match: "match_id", compatibility_test: "test_id", organ_allocation: "allocation_id", transplant_follow_up: "follow_up_id", app_user: "user_id", app_session: "session_id" }[entity] || `${entity}_id`;
  // Preserve Phase 3C/3D's existing SQL/parameter contract for anonymous development writes.
  if (actorId === null) await db.execute("INSERT INTO audit_log (user_id, entity_name, entity_id, action) VALUES (NULL, ?, ?, ?)", [entity, recordId, action]);
  else await db.execute("INSERT INTO audit_log (user_id, entity_name, entity_id, action) VALUES (?, ?, ?, ?)", [actorId, entity, recordId, action]);
  await db.execute("INSERT INTO sync_outbox (aggregate_type, aggregate_id, event_type, payload) VALUES (?, ?, ?, ?)", [entity, recordId, `${entity.toUpperCase()}_${action}`, JSON.stringify({ [primaryKey]: recordId, action })]);
}
