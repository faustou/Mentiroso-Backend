// src/providers/famosos_curated_ar.js
import { getSeenSet, markSeen } from '../utils/seen.js';

export const category = 'famosos';
export const name = 'famosos_curated_ar';
export const weight = 4; // ↑ prioridad alta sobre Wikidata/TMDb

// Lista hiper conocida (AR + global). Podés editar libremente.
const LIST = [
  // Deportes
  'Lionel Messi','Diego Maradona','Juan Martín del Potro','Manu Ginóbili','Gabriela Sabatini',
  // Música (Latam/Global)
  'Shakira','Bad Bunny','Karol G','Daddy Yankee','Ricky Martin','Luis Miguel',
  'Michael Jackson','Madonna','Adele','Ed Sheeran','Taylor Swift',
  // Cine/TV
  'Ricardo Darín','Guillermo Francella','Meryl Streep','Brad Pitt','Angelina Jolie','Leonardo DiCaprio',
  'Will Smith','Keanu Reeves','Dwayne Johnson',
  // Política/Historia (conocidos masivamente)
  'Papa Francisco','Eva Perón','Nelson Mandela','Barack Obama',
  // Internet/Cultura pop
  'Messi','Cristiano Ronaldo' // repetidos intencionalmente para aumentar frecuencia
];

const pick = a => a[Math.floor(Math.random()*a.length)];

export async function getRandom({ session } = {}) {
  const seen = getSeenSet(session);
  const keyOf = (t) => `famosos:${t.toLowerCase()}`;

  const pool = LIST.filter(t => !seen.has(keyOf(t)));
  const text = (pool.length ? pick(pool) : pick(LIST));

  if (session) markSeen(session, keyOf(text));

  return { text, category, source: 'curated', meta: {} };
}
