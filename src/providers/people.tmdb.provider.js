import { getJson } from '../utils/http.js';

export const category = 'famosos';
export const name = 'tmdb_people';
export const weight = 1;

export async function getRandom() {
  const apiKey = process.env.TMDB_API_KEY;
  const page = 1 + Math.floor(Math.random() * 5);
  const url = `https://api.themoviedb.org/3/person/popular?language=es-ES&page=${page}&api_key=${apiKey}`;
  const data = await getJson(url);
  const arr = data.results || [];
  if (!arr.length) throw new Error('No people found');
  const pick = arr[Math.floor(Math.random() * arr.length)];
  return {
    text: pick.name,
    category,
    meta: { known_for: (pick.known_for_department || '').toLowerCase() }
  };
}