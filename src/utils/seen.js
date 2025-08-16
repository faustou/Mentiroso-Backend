const _seen = new Map(); // sessionId -> { expiresAt, keys: Set<string> }
const TTL_MS = 1000 * 60 * 60 * 6;

export function getSeenSet(sessionId) {
  if (!sessionId) return new Set();
  const now = Date.now();
  const cur = _seen.get(sessionId);
  if (cur && cur.expiresAt > now) return cur.keys;
  const entry = { expiresAt: now + TTL_MS, keys: new Set() };
  _seen.set(sessionId, entry);
  setTimeout(() => {
    const c = _seen.get(sessionId);
    if (c && c.expiresAt <= Date.now()) _seen.delete(sessionId);
  }, TTL_MS + 1000);
  return entry.keys;
}
export function markSeen(sessionId, id) {
  if (!sessionId) return;
  getSeenSet(sessionId).add(id);
}
