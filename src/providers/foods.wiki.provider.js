// src/providers/comidas_comun_ar.provider.js
import { getSeenSet, markSeen } from '../utils/seen.js';

export const category = 'comidas';
export const name = 'comidas_comun_ar';
export const weight = 3; // ← alto: priorizá este sobre wikipedia

// Bien conocidas en Argentina y la región
const LIST = [
  // platos/comidas
  'pizza','empanadas','asado','milanesa','hamburguesa','choripán','lomito',
  'fideos','ravioles','ñoquis','arroz','ensalada','sopa',
  'tarta','tostado','pancho','sándwich','tortilla de papas',
  'provoleta','guiso','risotto','paella',
  'tacos','arepas','fajitas','quesadilla','sushi',
  // dulces/postres
  'helado','flan','alfajor','chocotorta','budín','tiramisu','panqueques',
  // desayunos/merienda
  'tostadas','medialunas','facturas'
];

const pick = a => a[Math.floor(Math.random() * a.length)];

export async function getRandom({ session } = {}) {
  const seen = getSeenSet(session);
  const keyOf = t => `comidas:${t.toLowerCase()}`;

  const pool = LIST.filter(t => !seen.has(keyOf(t)));
  const text = (pool.length ? pick(pool) : pick(LIST));

  if (session) markSeen(session, keyOf(text));

  return { text, category, source: 'curated', meta: {} };
}
