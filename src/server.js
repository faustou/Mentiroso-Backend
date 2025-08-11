import 'dotenv/config';
import express from 'express';
import { getCategories, pickProvider } from './registry.js';

const app = express();

app.get('/health', (_,res) => res.json({ ok: true }));

app.get('/categories', (_,res) => res.json({ categories: getCategories() }));

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
