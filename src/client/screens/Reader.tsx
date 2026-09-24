import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Affirmation } from '../../shared/types';
import { parseDocument } from '../../shared/markdown';
import { useStore } from '../lib/store';
import { usePrefs } from '../lib/prefs';
import { useFollowAlong } from '../lib/speech/useFollowAlong';
import { useVoicePreload, useVoiceStatus } from '../lib/speech/useVoiceStatus';
import { AffirmationText } from '../components/AffirmationText';
import { Icon } from '../components/Icon';
import { Button, IconButton, cx } from '../components/ui';

const SWIPE_DISTANCE = 60;
const ADVANCE_DELAY_MS = 1100;

export function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { due, affirmations, isRead, streak, hueOf } = useStore();
  useVoicePreload('load');

  // Read today's list in order; an affirmation not scheduled today is read on its own.
  const standalone = !due.some(a => a.id === Number(id));
  const queue = useMemo(
    () => (standalone ? affirmations.filter(a => a.id === Number(id)) : due),
    [standalone, id, due, affirmations],
  );

  const [index, setIndex] = useState(() => Math.max(0, queue.findIndex(a => a.id === Number(id))));
  const [finished, setFinished] = useState(false);
  const aff = queue[index];

  const close = () => (standalone ? navigate(-1) : navigate('/'));
  if (!aff || finished) return <Finale streak={streak} onDone={() => navigate('/')} />;

  const go = (next: number) => {
    if (next < queue.length) setIndex(Math.max(0, next));
    else if (!standalone && queue.every(a => isRead(a.id))) setFinished(true);
    else close();
  };

  return (
    <div className="ambient fixed inset-0 flex flex-col transition-[background] duration-700" style={{ '--hue': hueOf(aff.id) } as CSSProperties}>
      <header className="flex items-center gap-2 px-2 pt-safe">
        <IconButton icon="close" label="Close" onClick={close} />
        <div className="flex flex-1 gap-1.5" role="tablist" aria-label="Affirmations">
          {queue.map((a, i) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}. ${a.title}`}
              onClick={() => setIndex(i)}
              className="flex-1 py-3"
            >
              <span
                className={cx('block h-1 rounded-full transition-colors', i === index ? 'bg-fg' : isRead(a.id) ? 'bg-muted' : 'bg-fg/15')}
              />
            </button>
          ))}
        </div>
        <span className="w-11 text-center text-xs tabular-nums text-muted">
          {index + 1}/{queue.length}
        </span>
      </header>

      <ReaderCard key={aff.id} affirmation={aff} number={index + 1} onPrev={() => go(index - 1)} onNext={() => go(index + 1)} />
    </div>
  );
}

function ReaderCard({ affirmation, number, onPrev, onNext }: { affirmation: Affirmation; number: number; onPrev: () => void; onNext: () => void }) {
  const { isRead, setRead } = useStore();
  const [{ autoAdvance }] = usePrefs();
  const doc = useMemo(() => parseDocument(affirmation.body), [affirmation.body]);
  const [celebrate, setCelebrate] = useState(false);
  const read = isRead(affirmation.id);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchStart = useRef<number | null>(null);

  const follow = useFollowAlong(doc, () => {
    setRead(affirmation.id, true);
    setCelebrate(true);
    if (autoAdvance) advanceTimer.current = setTimeout(onNext, ADVANCE_DELAY_MS);
  });

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const toggleRead = () => {
    setRead(affirmation.id, !read);
    setCelebrate(!read);
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (dx > SWIPE_DISTANCE) onPrev();
    else if (dx < -SWIPE_DISTANCE) onNext();
  };

  const following = follow.state !== 'idle' || follow.cursor > 0;

  return (
    <>
      <main
        className="flex-1 overflow-y-auto"
        onTouchStart={e => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <article className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-7 py-10 text-center animate-rise">
          <h2 className="mb-8 text-[1.35rem] leading-tight font-light uppercase tracking-[0.12em] text-hue">
            {number}. {affirmation.title}
          </h2>
          <AffirmationText doc={doc} cursor={following ? follow.cursor : null} />
        </article>
      </main>

      <footer className="px-6 pb-safe">
        <p className="mb-3 min-h-5 text-center text-sm text-muted" aria-live="polite">
          {celebrate && read ? 'Beautiful.' : <FollowHint follow={follow} read={read} />}
        </p>
        <div className="mx-auto flex max-w-xs items-center justify-between">
          <button
            onClick={toggleRead}
            aria-label={read ? 'Mark as not read' : 'Mark as read'}
            aria-pressed={read}
            className={cx(
              'grid size-14 place-items-center rounded-full border-2 transition active:scale-90',
              read ? 'border-hue bg-hue text-bg' : 'border-line text-muted',
            )}
          >
            <Icon name="check" className={cx('size-6', celebrate && read && 'animate-pop')} strokeWidth={2.5} />
          </button>

          {follow.unavailable ? (
            <Button onClick={() => (read ? onNext() : toggleRead())} className="h-14 px-8">
              {read ? 'Next' : 'I said it'}
            </Button>
          ) : (
            <button
              onClick={follow.state === 'idle' ? follow.start : follow.stop}
              aria-label={follow.state === 'idle' ? 'Read aloud' : 'Stop listening'}
              className="relative grid size-20 place-items-center rounded-full bg-hue text-bg shadow-[0_0_40px_-8px] shadow-hue transition active:scale-95"
            >
              {follow.state === 'listening' && <span className="absolute inset-0 rounded-full bg-hue animate-pulse-ring" aria-hidden />}
              {follow.state === 'starting' ? (
                <span className="size-7 animate-spin rounded-full border-[3px] border-bg/30 border-t-bg" aria-hidden />
              ) : (
                <Icon name={follow.state === 'listening' ? 'stop' : 'mic'} className="relative size-8" />
              )}
            </button>
          )}

          <button onClick={onNext} aria-label="Next" className="grid size-14 place-items-center rounded-full border-2 border-line text-muted transition active:scale-90">
            <Icon name="next" className="size-6" />
          </button>
        </div>
      </footer>
    </>
  );
}

function FollowHint({ follow, read }: { follow: ReturnType<typeof useFollowAlong>; read: boolean }) {
  const voice = useVoiceStatus();
  if (follow.error) return <>{follow.error}</>;
  if (follow.state === 'starting') {
    return <>{voice.state === 'downloading' ? `Downloading voice model… ${Math.round(voice.progress * 100)}%` : 'Getting ready…'}</>;
  }
  if (follow.state === 'listening') {
    return (
      <>
        Listening… read it aloud
        {follow.engine === 'device' && <span className="ml-1.5 text-faint">· on this device</span>}
      </>
    );
  }
  if (follow.unavailable) return <>Read it aloud, then tap “I said it”</>;
  return <>{read ? 'Read. Tap the mic to say it again.' : 'Tap the mic and read aloud'}</>;
}

function Finale({ streak, onDone }: { streak: number; onDone: () => void }) {
  return (
    <div className="ambient fixed inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ '--hue': 330 } as CSSProperties}>
      <Icon name="sparkle" className="size-16 text-hue glow animate-pop" strokeWidth={1.25} />
      <h1 className="mt-6 text-3xl font-light animate-rise">That’s everything for today.</h1>
      <p className="mt-3 text-muted animate-rise">
        {streak > 1 ? `${streak} days in a row. Keep it glowing.` : 'See you tomorrow.'}
      </p>
      <Button className="mt-10 w-full max-w-xs" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
