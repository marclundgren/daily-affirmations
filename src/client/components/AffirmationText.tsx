import type { Document, RenderBlock, Token } from '../../shared/markdown';

interface Props {
  doc: Document;
  /** Number of spoken words read so far; null when not following along. */
  cursor?: number | null;
  size?: 'full' | 'compact';
}

function Word({ token, cursor }: { token: Token; cursor: number | null }) {
  const pending = cursor !== null && token.target !== null && token.target >= cursor;
  const classes = [
    'transition-opacity duration-150',
    token.strong && 'font-bold text-hue glow',
    token.em && 'italic',
    pending && 'opacity-30',
  ];
  return <span className={classes.filter(Boolean).join(' ')}>{token.text}</span>;
}

const STYLES: Record<Props['size'] & string, Record<RenderBlock['kind'], string>> = {
  full: {
    p: 'text-lg leading-relaxed text-muted font-light',
    quote: 'text-[1.7rem] leading-[1.3] font-bold tracking-tight text-fg',
    li: 'text-xl leading-snug font-semibold text-fg',
    h: 'text-sm uppercase tracking-[0.2em] text-hue font-light',
  },
  compact: {
    p: 'text-sm leading-relaxed text-muted font-light',
    quote: 'text-lg leading-snug font-bold text-fg',
    li: 'text-base leading-snug font-semibold text-fg',
    h: 'text-xs uppercase tracking-[0.2em] text-hue font-light',
  },
};

/** Consecutive list items render as one <ul>. */
function group(blocks: RenderBlock[]): (RenderBlock | RenderBlock[])[] {
  const groups: (RenderBlock | RenderBlock[])[] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.kind === 'li' && Array.isArray(last)) last.push(block);
    else groups.push(block.kind === 'li' ? [block] : block);
  }
  return groups;
}

export function AffirmationText({ doc, cursor = null, size = 'full' }: Props) {
  const styles = STYLES[size];
  const words = (block: RenderBlock) => block.tokens.map((token, i) => <Word key={i} token={token} cursor={cursor} />);

  return (
    <div className={size === 'full' ? 'space-y-6' : 'space-y-3'}>
      {group(doc.blocks).map((item, i) => {
        if (Array.isArray(item)) {
          return (
            <ul key={i} className="space-y-3 text-left">
              {item.map((block, j) => (
                <li key={j} className={`flex gap-3 ${styles.li}`}>
                  <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-hue" aria-hidden />
                  <span>{words(block)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (item.kind === 'quote') {
          return (
            <blockquote key={i} className={styles.quote}>
              <span className="text-hue" aria-hidden>“</span>
              {words(item)}
              <span className="text-hue" aria-hidden>”</span>
            </blockquote>
          );
        }
        const Tag = item.kind === 'h' ? 'h3' : 'p';
        return <Tag key={i} className={styles[item.kind]}>{words(item)}</Tag>;
      })}
    </div>
  );
}
