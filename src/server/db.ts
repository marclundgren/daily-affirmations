import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Affirmation, AffirmationInput, Profile, Reading } from '../shared/types';
import { DEFAULT_AFFIRMATIONS } from './defaults';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS profiles (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    emoji      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS affirmations (
    id         INTEGER PRIMARY KEY,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    cadence    TEXT NOT NULL CHECK (cadence IN ('daily', 'weekly', 'monthly')),
    days       TEXT NOT NULL DEFAULT '[]',
    position   INTEGER NOT NULL DEFAULT 0,
    archived   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS readings (
    profile_id     INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    affirmation_id INTEGER NOT NULL REFERENCES affirmations(id) ON DELETE CASCADE,
    day            TEXT NOT NULL,
    read_at        TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (profile_id, affirmation_id, day)
  );

  CREATE INDEX IF NOT EXISTS readings_by_day ON readings (profile_id, day);
`;

interface AffirmationRow {
  id: number;
  title: string;
  body: string;
  cadence: Affirmation['cadence'];
  days: string;
  position: number;
  archived: number;
  updated_at: string;
}

const toAffirmation = (row: AffirmationRow): Affirmation => ({
  id: row.id,
  title: row.title,
  body: row.body,
  cadence: row.cadence,
  days: JSON.parse(row.days),
  position: row.position,
  archived: row.archived === 1,
  updatedAt: row.updated_at,
});

export type Store = ReturnType<typeof openStore>;

export function openStore(dataDir: string) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'affirmations.db'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const transaction = (fn: () => void) => {
    db.exec('BEGIN');
    try {
      fn();
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  const getAffirmation = (id: number) => {
    const row = db.prepare('SELECT * FROM affirmations WHERE id = ?').get(id) as AffirmationRow | undefined;
    return row && toAffirmation(row);
  };

  const store = {
    listProfiles: () => db.prepare('SELECT id, name, emoji FROM profiles ORDER BY id').all() as unknown as Profile[],

    createProfile: ({ name, emoji }: Omit<Profile, 'id'>): Profile => {
      const { lastInsertRowid } = db.prepare('INSERT INTO profiles (name, emoji) VALUES (?, ?)').run(name, emoji);
      return { id: Number(lastInsertRowid), name, emoji };
    },

    updateProfile: (id: number, { name, emoji }: Omit<Profile, 'id'>): Profile | undefined => {
      const { changes } = db.prepare('UPDATE profiles SET name = ?, emoji = ? WHERE id = ?').run(name, emoji, id);
      return changes ? { id, name, emoji } : undefined;
    },

    deleteProfile: (id: number) => db.prepare('DELETE FROM profiles WHERE id = ?').run(id).changes > 0,

    listAffirmations: () =>
      (db.prepare('SELECT * FROM affirmations ORDER BY position, id').all() as unknown as AffirmationRow[]).map(toAffirmation),

    getAffirmation,

    createAffirmation: (input: AffirmationInput): Affirmation => {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO affirmations (title, body, cadence, days, archived, position)
           VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM affirmations))`,
        )
        .run(input.title, input.body, input.cadence, JSON.stringify(input.days), input.archived ? 1 : 0);
      return getAffirmation(Number(lastInsertRowid))!;
    },

    updateAffirmation: (id: number, input: AffirmationInput): Affirmation | undefined => {
      db.prepare(
        `UPDATE affirmations SET title = ?, body = ?, cadence = ?, days = ?, archived = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).run(input.title, input.body, input.cadence, JSON.stringify(input.days), input.archived ? 1 : 0, id);
      return getAffirmation(id);
    },

    deleteAffirmation: (id: number) => db.prepare('DELETE FROM affirmations WHERE id = ?').run(id).changes > 0,

    reorderAffirmations: (ids: number[]) => {
      const update = db.prepare('UPDATE affirmations SET position = ? WHERE id = ?');
      transaction(() => ids.forEach((id, index) => update.run(index, id)));
    },

    listReadings: (profileId: number, since: string) =>
      db
        .prepare('SELECT affirmation_id AS affirmationId, day FROM readings WHERE profile_id = ? AND day >= ? ORDER BY day')
        .all(profileId, since) as unknown as Reading[],

    setReading: (profileId: number, affirmationId: number, day: string, read: boolean) => {
      if (read) {
        db.prepare('INSERT OR IGNORE INTO readings (profile_id, affirmation_id, day) VALUES (?, ?, ?)').run(profileId, affirmationId, day);
      } else {
        db.prepare('DELETE FROM readings WHERE profile_id = ? AND affirmation_id = ? AND day = ?').run(profileId, affirmationId, day);
      }
    },
  };

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM affirmations').get() as { count: number };
  if (count === 0) transaction(() => DEFAULT_AFFIRMATIONS.forEach(store.createAffirmation));

  return store;
}
