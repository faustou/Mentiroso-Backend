import fetch from 'node-fetch';

export async function getJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { 'Accept': 'application/json', ...(opts.headers||{}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}