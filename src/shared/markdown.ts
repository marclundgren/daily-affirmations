/**
 * A deliberately tiny markdown subset for affirmations:
 *   > quote        — the words you say aloud (followed by the mic)
 *   - item / 1. item — list items
 *   # heading
 *   **strong**     — glowing highlight
 *   *em* / _em_
 * Everything else is a paragraph. Rendering is split into word tokens so the
 * reader can highlight words as they are spoken.
 */

export type BlockKind = 'p' | 'quote' | 'li' | 'h';

export interface Span {
  text: string;
  strong: boolean;
  em: boolean;
}

export interface Block {
  kind: BlockKind;
  spans: Span[];
}

export interface Token {
  text: string;
  strong: boolean;
  em: boolean;
  /** Index into the spoken-word targets, or null for whitespace / non-spoken text. */
  target: number | null;
}

export interface RenderBlock {
  kind: BlockKind;
  tokens: Token[];
}

export interface Document {
  blocks: RenderBlock[];
  /** Words the reader is expected to say, in order, normalized for matching. */
  targets: string[];
  /** The same words as a recognizer's vocabulary spells them (lowercase, apostrophes kept). */
  vocabulary: string[];
}

function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  const pattern = /\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|_(.+?)_/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) spans.push({ text: text.slice(last, match.index), strong: false, em: false });
    const [, strongA, strongB, emA, emB] = match;
    const strong = strongA ?? strongB;
    spans.push({ text: strong ?? emA ?? emB, strong: strong !== undefined, em: strong === undefined });
    last = match.index + match[0].length;
  }
  if (last < text.length) spans.push({ text: text.slice(last), strong: false, em: false });
  return spans;
}

export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', spans: parseInline(paragraph.join(' ')) });
    if (quote.length) blocks.push({ kind: 'quote', spans: parseInline(quote.join(' ')) });
    paragraph = [];
    quote = [];
  };

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    const quoteLine = /^>\s?(.*)$/.exec(line);
    const listLine = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);

    if (!line) {
      flush();
    } else if (quoteLine) {
      if (paragraph.length) flush();
      // A bare ">" line separates two quotes.
      if (quoteLine[1]) quote.push(quoteLine[1]);
      else flush();
    } else if (listLine || heading) {
      flush();
      blocks.push({ kind: listLine ? 'li' : 'h', spans: parseInline((listLine ?? heading)![1]) });
    } else {
      if (quote.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

/** Lowercased letters/digits only, so "isn't," matches a recognizer's "isnt". */
export function normalizeWord(word: string): string {
  return word.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');
}

/** "Isn’t," → "isn't" */
export function vocabularyWord(word: string): string {
  return word.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']/gu, '').replace(/^'+|'+$/g, '');
}

export function parseDocument(markdown: string): Document {
  const parsed = parseBlocks(markdown);
  // If the text has quotes, only the quotes are spoken. Otherwise, all of it is.
  const spokenKinds: BlockKind[] = parsed.some(b => b.kind === 'quote') ? ['quote'] : ['p', 'li', 'h'];
  const targets: string[] = [];
  const vocabulary: string[] = [];

  const blocks = parsed.map(block => {
    const spoken = spokenKinds.includes(block.kind);
    const tokens: Token[] = [];
    for (const span of block.spans) {
      for (const piece of span.text.split(/(\s+)/)) {
        if (!piece) continue;
        const word = normalizeWord(piece);
        const isTarget = spoken && word.length > 0;
        tokens.push({ text: piece, strong: span.strong, em: span.em, target: isTarget ? targets.length : null });
        if (isTarget) {
          targets.push(word);
          vocabulary.push(vocabularyWord(piece));
        }
      }
    }
    return { kind: block.kind, tokens };
  });

  return { blocks, targets, vocabulary };
}

/** First spoken sentence, as plain text — used for list previews. */
export function previewText(markdown: string): string {
  const blocks = parseBlocks(markdown);
  const block = blocks.find(b => b.kind === 'quote') ?? blocks[0];
  return block ? block.spans.map(s => s.text).join('') : '';
}
