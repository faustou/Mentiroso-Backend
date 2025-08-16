// src/providers/movies.wikidata.provider.js
import { getJson } from '../utils/http.js';
import { getSeenSet, markSeen } from '../utils/seen.js';

export const category = 'peliculas';
export const name = 'wikidata_peliculas_es';
export const weight = 3; // prioridad alta (podés subir/bajar)

const ENDPOINT = 'https://query.wikidata.org/sparql';

// Películas (Q11424). Tomamos muy conocidas con muchos sitelinks.
// itemLabel viene en español por el label service.
const SPARQL = `
SELECT ?item ?itemLabel ?sitelinks ?date WHERE {
  ?item wdt:P31 wd:Q11424 .
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL { ?item wdt:P577 ?date . }  # fecha de lanzamiento
  FILTER(?sitelinks >= 40)             # "famosas": ajustá el umbral si querés
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,[AUTO_LANGUAGE],en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 500
`;

// Fallback por si el endpoint falla (en español / muy conocidas)
const FALLBACK = [
  'Titanic', 'Avatar', 'El Padrino', 'Forrest Gump', 'Jurassic Park',
  'Toy Story', 'Shrek', 'Harry Potter', 'El señor de los anillos',
  'Volver al futuro', 'Star Wars', 'Matrix', 'Gladiador', 'Pulp Fiction',
  'Coco', 'Buscando a Nemo', 'Los Increíbles', 'Rápidos y furiosos',
  'Rocky', 'La La Land'
];

let CACHE = { ts: 0, items: [] };
const TTL_MS = 10 * 60 * 1000; // 10 minutos

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function yearFromDate(dateLiteral) {
  // Wikidata guarda xsd:dateTime (e.g. "1999-03-31T00:00:00Z")
  if (!dateLiteral) return undefined;
  const s = String(dateLiteral);
  const m = s.match(/\b(-?\d{1,4})/);
  return m ? m[1] : undefined;
}

async function fetchList() {
  const url = `${ENDPOINT}?query=${encodeURIComponent(SPARQL)}&format=json`;
  const data = await getJson(url, {
    headers: { Accept: 'application/sparql-results+json' },
    timeoutMs: 12000, // más permisivo que por defecto
    retries: 1
  });

  const rows = data?.results?.bindings || [];
  // Mapeamos a {title, year}
  const list = rows.map(b => {
    const title = b?.itemLabel?.value;
    const year = yearFromDate(b?.date?.value);
    return title ? { title, year } : null;
  }).filter(Boolean);

  // quitamos duplicados por título (minúsculas)
  const seen = new Set();
  const uniq = [];
  for (const it of list) {
    const k = it.title.toLowerCase();
    if (!seen.has(k)) { seen.add(k); uniq.push(it); }
  }
  return uniq;
}

async function getList() {
  const now = Date.now();
  if (CACHE.items.length && now - CACHE.ts < TTL_MS) return CACHE.items;

  try {
    const list = await fetchList();
    if (list.length) {
      CACHE = { ts: now, items: list };
      return list;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[peliculas] Wikidata falló, uso fallback:', e.message || e);
    }
  }
  // Si falla, devolvemos fallback como {title, year: undefined}
  CACHE = { ts: now, items: FALLBACK.map(t => ({ title: t, year: undefined })) };
  return CACHE.items;
}

export async function getRandom({ session } = {}) {
  const items = await getList();
  const seen = getSeenSet(session);
  const keyOf = (t) => `peliculas:${t.toLowerCase()}`;

  const pool = items.filter(it => !seen.has(keyOf(it.title)));
  const pickItem = (pool.length ? pick(pool) : pick(items));

  const text = pickItem.year ? `${pickItem.title} (${pickItem.year})` : pickItem.title;

  if (session) markSeen(session, keyOf(pickItem.title));

  return {
    text,
    category,
    source: CACHE.items === items ? 'wikidata' : 'fallback',
    meta: { year: pickItem.year }
  };
}
