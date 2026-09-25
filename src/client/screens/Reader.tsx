import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Affirmation } from '../../shared/types';
import { parseDocument } from '../../shared/markdown';
import { useStore } from '../lib/store';
import { usePrefs } from '../lib/prefs';
import { useFollowAlong } from '../lib/speech/useFollowAlong';
import { useVoicePreload, useVoiceStatus } from '../lib/speech/useVoiceStatus';
import { releaseMicrophone } from '../lib/speech/deviceEngine';
import { AffirmationText } from '../components/AffirmationText';
import { Icon } from '../components/Icon';
import { Button, IconButton, cx } from '../components/ui';

const SWIPE_DISTANCE = 60;
/** Matches the page-out animation in styles.css. */
const PAGE_OUT_MS = 500;

export function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { due, affirmations, isRead, streak, hueOf } = useStore();
  useVoicePreload('load');
  // The microphone stays open from one affirmation to the next; turn it off on the way out.
  useEffect(() => releaseMicrophone, []);

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
    <div className="ambient fixed inset-0 flex flex-col" style={{ '--hue': hueOf(aff.id), transition: '--hue 1.2s ease' } as CSSProperties}>
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
  const [{ advanceAfter }] = usePrefs();
  const doc = useMemo(() => parseDocument(affirmation.body), [affirmation.body]);
  const [celebrate, setCelebrate] = useState(false);
  const read = isRead(affirmation.id);
  const touchStart = useRef<number | null>(null);

  // After reading aloud: rest on the page (for good, or for `advanceAfter` seconds), then turn it.
  // Any interaction cancels the turn.
  const [phase, setPhase] = useState<'reading' | 'resting' | 'turning'>('reading');
  const restMs = advanceAfter === null ? null : advanceAfter * 1000;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelTurn = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('reading');
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const follow = useFollowAlong(doc, () => {
    setRead(affirmation.id, true);
    setCelebrate(true);
    setPhase('resting');
    if (restMs === null) return;
    timers.current = [
      setTimeout(() => setPhase('turning'), restMs),
      setTimeout(onNext, restMs + PAGE_OUT_MS),
    ];
  });

  const markRead = () => {
    cancelTurn();
    setRead(affirmation.id, true);
    setCelebrate(true);
  };

  const listen = () => {
    cancelTurn();
    follow.start();
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
        <article
          className={cx(
            'mx-auto flex min-h-full max-w-lg flex-col justify-center px-7 py-10 text-center',
            phase === 'turning' ? 'animate-page-out' : 'animate-page-in',
          )}
        >
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
        {/* The mic sits in the middle; an empty cell on the left keeps it centered. */}
        <div className="mx-auto grid max-w-xs grid-cols-[1fr_auto_1fr] items-center">
          <span />

          {follow.unavailable ? (
            <Button onClick={() => (read ? onNext() : markRead())} className="h-14 px-8">
              {read ? 'Next' : 'I said it'}
            </Button>
          ) : (
            <button
              onClick={follow.state === 'idle' ? listen : follow.stop}
              aria-label={follow.state === 'idle' ? 'Read aloud' : 'Stop listening'}
              className={cx(
                'relative grid size-20 place-items-center rounded-full transition active:scale-95',
                // Once it's been read, the mic steps back so the next step stands out.
                read && follow.state === 'idle' ? 'border-2 border-hue/50 text-hue' : 'bg-hue text-bg shadow-[0_0_40px_-8px] shadow-hue',
              )}
            >
              {follow.state === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-hue animate-breathe" aria-hidden />
                  <span className="absolute inset-0 rounded-full bg-hue animate-breathe [animation-delay:-1.4s]" aria-hidden />
                </>
              )}
              {follow.state === 'starting' ? (
                <span className="size-7 animate-spin rounded-full border-[3px] border-bg/30 border-t-bg" aria-hidden />
              ) : (
                <Icon name={follow.state === 'listening' ? 'stop' : 'mic'} className="relative size-8" />
              )}
            </button>
          )}

          <button
            onClick={onNext}
            aria-label="Next"
            className={cx(
              'relative grid size-14 place-items-center justify-self-end rounded-full border-2 transition-colors duration-700 active:scale-90',
              // Staying put: invite (don't push) the reader on once they're done.
              phase !== 'reading' && restMs === null ? 'border-hue bg-hue text-bg' : 'border-line text-muted',
            )}
          >
            {phase !== 'reading' && restMs !== null && <Countdown ms={restMs} />}
            <Icon name="next" className="size-6" />
          </button>
        </div>
      </footer>
    </>
  );
}

/** A ring that slowly fills around the Next button while resting on a finished affirmation. */
function Countdown({ ms }: { ms: number }) {
  const r = 27;
  const circumference = 2 * Math.PI * r;
  return (
    <svg className="absolute -inset-0.5 -rotate-90" viewBox="0 0 58 58" aria-hidden>
      <circle
        cx="29"
        cy="29"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        className="stroke-hue animate-countdown"
        style={{ '--duration': `${ms}ms`, '--circumference': circumference } as CSSProperties}
      />
    </svg>
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
