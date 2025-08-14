import 'dotenv/config';
import express from 'express';
import { getCategories, pickProvider } from './registry.js';
import cors from 'cors'

const app = express();

const allowed = [
  'http://localhost:5173/',      // Vite dev
  'http://127.0.0.1:5173',
  'https://tuapp.vercel.app'    // tu front en prod (ajustá el dominio)
]

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, true)
    return cb(new Error('CORS: origin no permitido'))
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Content-Type'],
  maxAge: 86400
}))

app.get('/health', (_,res) => res.json({ ok: true }));

app.get('/categories', (req, res) => {
  res.json({
    categories: getCategories().filter(Boolean) // <- acá filtrás los null o vacíos
  })
})

app.get('/random', async (req, res) => {
  try {
    const category = (req.query.category || '').toString().toLowerCase();
    if (!category) return res.status(400).json({ error: 'Falta ?category=' });
    const provider = pickProvider(category);
    const result = await provider.getRandom();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API on http://localhost:${port}`));
