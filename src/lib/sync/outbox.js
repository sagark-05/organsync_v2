// Metadata only: no names, dates of birth, contact details, or credentials.
export async function recordMutation(db, entity, recordId, action) {
  await db.execute("INSERT INTO audit_log (user_id, entity_name, entity_id, action) VALUES (NULL, ?, ?, ?)", [entity, recordId, action]);
  await db.execute("INSERT INTO sync_outbox (aggregate_type, aggregate_id, event_type, payload) VALUES (?, ?, ?, ?)", [entity, recordId, `${entity.toUpperCase()}_${action}`, JSON.stringify({ [`${entity}_id`]: recordId, action })]);
}
