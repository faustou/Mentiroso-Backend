// src/registry.js
import * as movies from './providers/movies.tmdb.provider.js';
import * as people from './providers/people.tmdb.provider.js';
import * as things from './providers/things.restcountries.provider.js';
import * as foods from './providers/foods.wiki.provider.js';
import * as nature from './providers/nature.wiki.provider.js';

// Mapa: categoria (lowercase/trim) -> providers[]
const REGISTRY = new Map();

function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

function register(provider) {
  const key = norm(provider?.category);
  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[registry] Provider sin category válido:', provider?.name || '(sin name)');
    }
    return;
  }
  const list = REGISTRY.get(key) || [];
  list.push(provider);
  REGISTRY.set(key, list);
}

// Registrar aquí (o cargar dinámico desde carpeta)
[movies, people, things, foods, nature].forEach(register);

// Logs de diagnóstico al levantar
if (process.env.NODE_ENV !== 'production') {
  console.log('[REGISTRY] categorías registradas:', [...REGISTRY.keys()]);
  console.log(
    '[REGISTRY] detalle:',
    [...REGISTRY.entries()].map(([k, v]) => ({
      category: k,
      providers: v.map(p => ({
        name: p?.name,
        hasGetRandom: typeof p?.getRandom === 'function'
      }))
    }))
  );
}

export function getCategories() {
  return [...REGISTRY.keys()];
}

export function pickProvider(category) {
  const key = norm(category);
  const list = REGISTRY.get(key);
  if (!list || !list.length) {
    throw new Error(`Categoría no soportada: ${category}`);
  }
  // si hay pesos, selección ponderada
  const total = list.reduce((s, p) => s + (p.weight || 1), 0);
  let r = Math.random() * total;
  for (const p of list) {
    r -= (p.weight || 1);
    if (r <= 0) return p;
  }
  return list[0];
}
