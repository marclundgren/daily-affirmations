import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDocument, previewText } from './markdown';
import { advance } from './follow';
import { isDue, streak, dayKey, describeSchedule } from './schedule';
import type { Affirmation } from './types';

const body = `Say:

> Clear my energy of all negativity. Help me release what isn't.

Your energy **shapes your reality.**`;

test('only quoted text is spoken when a quote exists', () => {
  const doc = parseDocument(body);
  assert.deepEqual(doc.blocks.map(b => b.kind), ['p', 'quote', 'p']);
  assert.deepEqual(doc.targets, ['clear', 'my', 'energy', 'of', 'all', 'negativity', 'help', 'me', 'release', 'what', 'isnt']);
  const strong = doc.blocks[2].tokens.filter(t => t.strong).map(t => t.text).join('');
  assert.equal(strong, 'shapes your reality.');
});

test('all text is spoken when there is no quote', () => {
  const doc = parseDocument('- I am **enough**\n- I am calm');
  assert.deepEqual(doc.targets, ['i', 'am', 'enough', 'i', 'am', 'calm']);
  assert.equal(doc.blocks.length, 2);
});

test('preview prefers the quote', () => {
  assert.equal(previewText(body), "Clear my energy of all negativity. Help me release what isn't.");
});

test('follow-along tolerates filler, drops and near-misses', () => {
  const { targets } = parseDocument(body);
  assert.equal(advance(targets, 0, 'um clear my energy'), 3);
  assert.equal(advance(targets, 3, 'of negativity'), 6); // skipped "all"
  assert.equal(advance(targets, 6, 'help me releases what isnt'), 11);
  assert.equal(advance(targets, 0, 'banana'), 0);
});

const aff = (over: Partial<Affirmation>): Affirmation => ({
  id: 1, title: 't', body: 'b', cadence: 'daily', days: [], position: 0, archived: false, updatedAt: '', ...over,
});

test('schedule', () => {
  const wed = new Date(2026, 8, 23); // Wednesday
  assert.equal(isDue(aff({}), wed), true);
  assert.equal(isDue(aff({ archived: true }), wed), false);
  assert.equal(isDue(aff({ cadence: 'weekly', days: [3] }), wed), true);
  assert.equal(isDue(aff({ cadence: 'weekly', days: [1, 5] }), wed), false);
  assert.equal(isDue(aff({ cadence: 'monthly', days: [31] }), new Date(2026, 8, 30)), true); // Sept has 30 days
  assert.equal(isDue(aff({ cadence: 'monthly', days: [31] }), new Date(2026, 8, 29)), false);
  assert.equal(describeSchedule({ cadence: 'monthly', days: [1, 22] }), 'Monthly · the 1st, 22nd');
});

test('streak counts back from today or yesterday', () => {
  const today = dayKey(new Date(2026, 8, 24));
  assert.equal(streak(new Set(['2026-09-24', '2026-09-23', '2026-09-21']), today), 2);
  assert.equal(streak(new Set(['2026-09-23', '2026-09-22']), today), 2);
  assert.equal(streak(new Set(['2026-09-20']), today), 0);
});
