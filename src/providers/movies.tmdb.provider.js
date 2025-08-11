import { getJson } from '../utils/http.js';

export const category = 'peliculas';
export const name = 'tmdb_movies';
export const weight = 1;

export async function getRandom() {
  const apiKey = process.env.TMDB_API_KEY;
  const page = 1 + Math.floor(Math.random() * 5); // primeras 5 páginas populares
  const url = `https://api.themoviedb.org/3/discover/movie?language=es-ES&sort_by=popularity.desc&vote_count.gte=1000&include_adult=false&page=${page}&api_key=${apiKey}`;
  const data = await getJson(url);
  const arr = data.results || [];
  if (!arr.length) throw new Error('No movies found');
  const pick = arr[Math.floor(Math.random() * arr.length)];
  return {
    text: pick.title,
    meta: { year: (pick.release_date||'').slice(0,4)},
    category
  };
}