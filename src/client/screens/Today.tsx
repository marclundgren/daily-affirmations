import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router';
import { previewText } from '../../shared/markdown';
import { parseDay } from '../../shared/schedule';
import { useStore } from '../lib/store';
import { Icon } from '../components/Icon';
import { Button, ProgressRing, cx } from '../components/ui';

function greeting(hour: number) {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Today() {
  const { profile, today, due, isRead, setRead, doneCount, streak, hueOf } = useStore();
  const navigate = useNavigate();
  const allDone = due.length > 0 && doneCount === due.length;
  const nextUp = due.find(a => !isRead(a.id)) ?? due[0];

  return (
    <main className="ambient min-h-dvh" style={{ '--hue': nextUp ? hueOf(nextUp.id) : 290 } as CSSProperties}>
      <div className="mx-auto max-w-xl px-5 pt-safe pb-28">
        <header className="pt-6">
          <p className="text-xs font-light uppercase tracking-[0.25em] text-muted">
            {parseDay(today).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-2 text-[2rem] leading-tight font-light">
            {greeting(new Date().getHours())}, <span className="font-semibold">{profile!.name}</span>
          </h1>
        </header>

        {due.length > 0 && (
          <section className="mt-8 flex items-center gap-5 rounded-3xl bg-surface p-5">
            <div className="relative shrink-0">
              <ProgressRing value={doneCount} total={due.length} />
              <span className="absolute inset-0 grid place-items-center text-lg font-semibold">
                {allDone ? <Icon name="check" className="size-7 text-accent animate-pop" strokeWidth={2.5} /> : `${doneCount}/${due.length}`}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{allDone ? 'All done for today' : doneCount ? 'Keep going' : 'Ready when you are'}</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                {streak > 0 ? (
                  <>
                    <Icon name="flame" className="size-4 text-orange-400" /> {streak}-day streak
                  </>
                ) : (
                  `${due.length} affirmation${due.length === 1 ? '' : 's'} today`
                )}
              </p>
            </div>
          </section>
        )}

        {due.length > 0 && (
          <Button className="mt-4 w-full" variant={allDone ? 'secondary' : 'primary'} onClick={() => navigate(`/read/${nextUp.id}`)}>
            <Icon name={allDone ? 'sparkle' : 'mic'} className="size-[18px]" />
            {allDone ? 'Read again' : doneCount ? 'Continue' : 'Begin'}
          </Button>
        )}

        <ol className="mt-8 space-y-3">
          {due.map((aff, i) => {
            const read = isRead(aff.id);
            return (
              <li key={aff.id} style={{ '--hue': hueOf(aff.id) } as CSSProperties} className="animate-rise" >
                <div className={cx('flex items-stretch overflow-hidden rounded-3xl bg-surface transition', read && 'opacity-55')}>
                  <Link to={`/read/${aff.id}`} className="min-w-0 flex-1 py-4 pl-5 active:opacity-70">
                    <p className="text-[11px] font-light uppercase tracking-[0.2em] text-hue">
                      {i + 1}. {aff.title}
                    </p>
                    <p className={cx('mt-1.5 line-clamp-2 text-[15px] leading-snug font-medium', read && 'line-through decoration-faint')}>
                      {previewText(aff.body)}
                    </p>
                  </Link>
                  <button
                    onClick={() => setRead(aff.id, !read)}
                    aria-label={read ? `Mark “${aff.title}” as not read` : `Mark “${aff.title}” as read`}
                    className="grid w-16 shrink-0 place-items-center"
                  >
                    <span className={cx('grid size-8 place-items-center rounded-full border-2 transition', read ? 'border-hue bg-hue text-bg' : 'border-faint')}>
                      {read && <Icon name="check" className="size-4 animate-pop" strokeWidth={3} />}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        {due.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg font-light">Nothing scheduled today.</p>
            <p className="mt-2 text-sm text-muted">Add affirmations or change their schedule in your library.</p>
            <Link to="/library" className="mt-6 inline-block text-sm font-medium text-accent">
              Open library
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
