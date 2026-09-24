import { normalizeWord } from './markdown';

/** How many target words a spoken word may skip ahead (tolerates recognizer drops). */
const LOOKAHEAD = 4;

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function wordsMatch(target: string, spoken: string): boolean {
  if (target === spoken) return true;
  if (target.length < 4 || spoken.length < 4) return false;
  return editDistanceAtMostOne(target, spoken) || target.startsWith(spoken) || spoken.startsWith(target);
}

/**
 * Whether reading is done. Recognizers often miss a final word (or don't know it), so after
 * a pause with at most one word left, that counts too — for anything longer than a few words.
 */
export function isComplete(targets: string[], cursor: number, afterPause: boolean): boolean {
  if (cursor >= targets.length) return true;
  return afterPause && targets.length > 3 && cursor >= targets.length - 1;
}

/**
 * Advance through `targets` from `cursor` using a transcript. Each spoken word may
 * match one of the next few targets; unmatched words (filler, misrecognitions) are ignored.
 * Returns the new cursor — the count of target words read so far.
 */
export function advance(targets: string[], cursor: number, transcript: string): number {
  for (const raw of transcript.split(/\s+/)) {
    const spoken = normalizeWord(raw);
    if (!spoken) continue;
    const end = Math.min(targets.length, cursor + LOOKAHEAD);
    for (let j = cursor; j < end; j++) {
      if (wordsMatch(targets[j], spoken)) {
        cursor = j + 1;
        break;
      }
    }
  }
  return cursor;
}
