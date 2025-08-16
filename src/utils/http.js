import fetch from 'node-fetch';

const UA = `MentirosoGame/1.0 (+contacto: faustoscarmato@hotmail.com)`; // poné algo propio

export async function getJson(url, { headers = {}, timeoutMs = 8000, retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json', ...headers },
        signal: ctrl.signal
      });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      lastErr = e;
      if (i < retries) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      throw lastErr;
    }
  }
}
