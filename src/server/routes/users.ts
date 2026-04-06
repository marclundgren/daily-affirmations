import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();
  res.json(users);
});

router.post('/', (req, res) => {
  const { name, avatar_emoji } = req.body;
  const result = db.prepare('INSERT INTO users (name, avatar_emoji) VALUES (?, ?)').run(name, avatar_emoji || '😊');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(user);
});

export default router;
