import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { user_id, date } = req.query;
  if (!user_id || !date) {
    return res.status(400).json({ error: 'user_id and date are required' });
  }
  const completions = db.prepare(
    'SELECT * FROM completions WHERE user_id = ? AND completed_date = ?'
  ).all(user_id, date);
  res.json(completions);
});

router.post('/', (req, res) => {
  const { user_id, affirmation_id } = req.body;
  const date = new Date().toISOString().split('T')[0];
  try {
    const result = db.prepare(
      'INSERT INTO completions (user_id, affirmation_id, completed_date) VALUES (?, ?, ?)'
    ).run(user_id, affirmation_id, date);
    const completion = db.prepare('SELECT * FROM completions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(completion);
  } catch {
    res.status(409).json({ error: 'Already completed today' });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM completions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
