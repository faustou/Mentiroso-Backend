// server.js
import 'dotenv/config';
import express from 'express';
import { getCategories, pickProvider } from './registry.js';
import cors from 'cors';

const app = express();

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mentiroso-frontend.vercel.app' // cambia por tu dominio real
]);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    return cb(new Error('CORS: origin no permitido'));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Content-Type'],
  maxAge: 86400
}));

app.use((req, _res, next) => { 
  if (process.env.NODE_ENV !== 'production') {
    console.log('Origin:', req.headers.origin);
  }
  next();
});

app.get('/health', (_,res) => res.json({ ok: true }));

app.get('/categories', (req, res) => {
  res.json({
    categories: getCategories().filter(Boolean)
  });
});

app.get('/random', async (req, res) => {
  try {
    const category = (req.query.category || '').toString().toLowerCase();
    const session = (req.query.session || '').toString();      // ← NUEVO
    if (!category) return res.status(400).json({ error: 'Falta ?category=' });

    const provider = pickProvider(category);

    console.log('[random]', 'category='+category, 'provider='+(provider?.name||''));

    // ⬇⬇⬇ pasamos { session } al provider
    const result = await provider.getRandom({ session });

    // (opcional) log de lo que retorna
    if (process.env.NODE_ENV !== 'production') {
      console.log('[random:result]', result);
    }

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});



const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API on http://localhost:${port}`));
