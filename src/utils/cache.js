// Cache simple en memoria con TTL
const store = new Map();

export function setCache(key, value, ttlMs = 60_000) {
  const expires = Date.now() + ttlMs;
  store.set(key, { value, expires });
}

export function getCache(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) { store.delete(key); return null; }
  return hit.value;
}