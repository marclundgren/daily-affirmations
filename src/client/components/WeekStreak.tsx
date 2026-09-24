import { Fragment } from 'react';
import { addDays, parseDay } from '../../shared/schedule';
import { cx } from './ui';

const DAYS = 7;

/** The last seven days as dot — dot — dot, filled where everything was completed. */
export function WeekStreak({ completedDays, today }: { completedDays: Set<string>; today: string }) {
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i - (DAYS - 1)));
  const done = days.filter(d => completedDays.has(d));

  return (
    <section className="flex items-center gap-4" aria-label={`Completed ${done.length} of the last ${DAYS} days`}>
      <ol className="grid flex-1 grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-y-1.5">
        {days.map((day, i) => {
          const complete = completedDays.has(day);
          const isToday = day === today;
          return (
            <Fragment key={day}>
              {i > 0 && (
                <span
                  aria-hidden
                  className={cx('row-start-1 h-0.5 rounded-full', complete && completedDays.has(days[i - 1]) ? 'bg-accent' : 'bg-fg/12')}
                />
              )}
              <li
                className="row-start-1 grid place-items-center"
                title={parseDay(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              >
                <span
                  className={cx(
                    'size-3.5 rounded-full border-2 transition-colors',
                    complete ? 'border-accent bg-accent' : isToday ? 'border-accent' : 'border-fg/25',
                  )}
                />
                <span className="sr-only">{complete ? 'completed' : 'not completed'}</span>
              </li>
            </Fragment>
          );
        })}
        {days.map((day, i) => (
          <span
            key={day}
            aria-hidden
            style={{ gridColumn: i * 2 + 1 }}
            className={cx('row-start-2 text-center text-[10px] font-medium', day === today ? 'text-fg' : 'text-faint')}
          >
            {parseDay(day).toLocaleDateString(undefined, { weekday: 'narrow' })}
          </span>
        ))}
      </ol>
      <p className="shrink-0 text-right leading-none" aria-hidden>
        <span className="text-xl font-semibold tabular-nums">
          {done.length}
          <span className="text-faint">/{DAYS}</span>
        </span>
      </p>
    </section>
  );
}
