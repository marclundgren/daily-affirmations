export type Cadence = 'daily' | 'weekly' | 'monthly';

export interface Affirmation {
  id: number;
  title: string;
  /** Markdown subset — see shared/markdown.ts. Blockquotes are the words spoken aloud. */
  body: string;
  cadence: Cadence;
  /** Weekly: weekdays 0 (Sun)–6 (Sat). Monthly: days of month 1–31. Daily: empty. */
  days: number[];
  position: number;
  archived: boolean;
  updatedAt: string;
}

export type AffirmationInput = Pick<Affirmation, 'title' | 'body' | 'cadence' | 'days' | 'archived'>;

export interface Profile {
  id: number;
  name: string;
  emoji: string;
}

export interface Reading {
  affirmationId: number;
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
}

export interface ServerConfig {
  imageImport: boolean;
}
