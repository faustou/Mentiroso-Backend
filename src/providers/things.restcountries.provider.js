// src/providers/objetos_es_wikidata.js
import { getJson } from '../utils/http.js';
import { getSeenSet, markSeen } from '../utils/seen.js';

export const category = 'objetos';
export const name = 'wikidata_objetos_es';
export const weight = 1;

const ENDPOINT = 'https://query.wikidata.org/sparql';
const SPARQL = `
SELECT ?item ?itemLabel WHERE {
  VALUES ?inst { wd:Q987767 wd:Q39546 wd:Q2424752 }  # objeto doméstico / herramienta / utensilio
  ?item wdt:P31/wdt:P279* ?inst .
  FILTER(NOT EXISTS { ?item wdt:P31 wd:Q4167410 })    # no desambiguaciones
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,[AUTO_LANGUAGE],en". }
}
LIMIT 250
`;

const FALLBACK = [
  'celular','llave','lámpara','silla','mesa','cuchillo','tenedor','cuchara','taza','botella',
  'mochila','reloj','gafas','libro','cuaderno','birome','computadora','televisor','control remoto',
  'auriculares','cargador','zapatilla','campera','pelota','toalla','almohada','colchón','ventilador',
  'microondas','heladera','plancha','espejo','cepillo de dientes','shampoo','cinturón','cartera'
];

let CACHE = { ts: 0, items: [] };         // {ts, items:string[]}
const TTL_MS = 10 * 60 * 1000;            // 10 minutos

const pick = (a)=>a[Math.floor(Math.random()*a.length)];

async function fetchWikidataList() {
  const url = `${ENDPOINT}?query=${encodeURIComponent(SPARQL)}&format=json`;
  const data = await getJson(url, { headers: { Accept: 'application/sparql-results+json' }, timeoutMs: 9000, retries: 1 });
  const rows = data?.results?.bindings || [];
  const list = rows.map(b => b?.itemLabel?.value).filter(Boolean);
  return Array.from(new Set(list)); // únicos
}

async function getList() {
  const now = Date.now();
  if (CACHE.items.length && now - CACHE.ts < TTL_MS) return CACHE.items;

  try {
    const list = await fetchWikidataList();
    if (list.length) {
      CACHE = { ts: now, items: list };
      return list;
    }
  } catch (e) {
    // Logueá en dev pero no rompas la app
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[objetos] Wikidata falló, uso fallback:', e.message || e);
    }
  }
  CACHE = { ts: now, items: FALLBACK };
  return FALLBACK;
}

export async function getRandom({ session } = {}) {
  const items = await getList();
  const seen = getSeenSet(session);
  const keyOf = (t) => `obj:${t.toLowerCase()}`;

  const pool = items.filter(t => !seen.has(keyOf(t)));
  const text = (pool.length ? pick(pool) : pick(items));

  if (session) markSeen(session, keyOf(text));

  return { text, category, source: CACHE.items === FALLBACK ? 'fallback' : 'wikidata', meta: {} };
}
