import * as movies from './providers/movies.tmdb.provider.js';
import * as people from './providers/people.tmdb.provider.js';
import * as countries from './providers/countries.restcountries.provider.js';
import * as foods from './providers/foods.wiki.provider.js';
import * as nature from './providers/nature.wiki.provider.js';

// Mapa: categoria -> providers[]
const REGISTRY = new Map();

function register(provider) {
  const list = REGISTRY.get(provider.category) || [];
  list.push(provider);
  REGISTRY.set(provider.category, list);
}

// Registrar aquí (o cargar dinámico desde carpeta)
[movies, people, countries, foods, nature].forEach(register);

export function getCategories() {
  return [...REGISTRY.keys()];
}

export function pickProvider(category) {
  const list = REGISTRY.get(category);
  if (!list || !list.length) throw new Error(`Categoría no soportada: ${category}`);
  // si hay pesos, hacer selección ponderada
  const total = list.reduce((s,p)=> s + (p.weight||1), 0);
  let r = Math.random() * total;
  for (const p of list) {
    r -= (p.weight||1);
    if (r <= 0) return p;
  }
  return list[0];
}
