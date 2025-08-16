// src/providers/naturaleza_comun.provider.js
import { getSeenSet, markSeen } from '../utils/seen.js';

export const category = 'naturaleza';
export const name = 'naturaleza_comun';
export const weight = 3; // ← alto: priorizá este sobre wikidata

// Lista bien conocida y variada (podés sumar más)
const LIST = [
  'cielo','nube','lluvia','viento','tormenta','arcoíris','relámpago','trueno',
  'sol','luna','estrella','galaxia',
  'árbol','flor','hoja','raíz','fruta','semilla','césped',
  'bosque','selva','desierto','pradera',
  'montaña','cordillera','valle','acantilado','caverna','cueva','catarata','cascada',
  'río','lago','laguna','mar','océano','playa','arena','roca','piedra',
  'volcán','lava','hielo','nieve','granizo','rocío','niebla'
];

const pick = a => a[Math.floor(Math.random() * a.length)];

export async function getRandom({ session } = {}) {
  const seen = getSeenSet(session);
  const keyOf = t => `naturaleza:${t.toLowerCase()}`;

  const pool = LIST.filter(t => !seen.has(keyOf(t)));
  const text = (pool.length ? pick(pool) : pick(LIST));

  if (session) markSeen(session, keyOf(text));

  return { text, category, source: 'curated', meta: {} };
}
