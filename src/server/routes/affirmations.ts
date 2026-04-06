import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const affirmations = db.prepare('SELECT * FROM affirmations ORDER BY sort_order, id').all();
  res.json(affirmations);
});

router.get('/today', (_req, res) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const affirmations = db.prepare(`
    SELECT * FROM affirmations
    WHERE is_active = 1 AND (
      cadence = 'daily'
      OR (cadence = 'weekly' AND schedule_day = ?)
      OR (cadence = 'monthly' AND (schedule_day = ? OR (schedule_day > ? AND ? = ?)))
    )
    ORDER BY sort_order, id
  `).all(dayOfWeek, dayOfMonth, lastDayOfMonth, dayOfMonth, lastDayOfMonth);

  res.json(affirmations);
});

router.patch('/reorder', (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order) || order.some((id: unknown) => typeof id !== 'number')) {
    return res.status(400).json({ error: 'order must be an array of numeric IDs' });
  }
  const update = db.prepare('UPDATE affirmations SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((ids: number[]) => {
    ids.forEach((id, index) => update.run(index, id));
  });
  reorder(order);
  res.json({ success: true });
});

router.post('/', (req, res) => {
  const { title, body, cadence, schedule_day, sort_order } = req.body;
  const result = db.prepare(
    'INSERT INTO affirmations (title, body, cadence, schedule_day, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(title, body, cadence, schedule_day ?? null, sort_order ?? 0);
  const affirmation = db.prepare('SELECT * FROM affirmations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(affirmation);
});

router.put('/:id', (req, res) => {
  const { title, body, cadence, schedule_day, sort_order, is_active } = req.body;
  db.prepare(`
    UPDATE affirmations
    SET title = ?, body = ?, cadence = ?, schedule_day = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, body, cadence, schedule_day ?? null, sort_order ?? 0, is_active ?? 1, req.params.id);
  const affirmation = db.prepare('SELECT * FROM affirmations WHERE id = ?').get(req.params.id);
  res.json(affirmation);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM completions WHERE affirmation_id = ?').run(req.params.id);
  db.prepare('DELETE FROM affirmations WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
