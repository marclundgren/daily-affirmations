import { useState } from 'react';
import { useStore } from '../lib/store';
import { cx } from '../components/ui';
import { ProfileForm } from '../components/ProfileForm';

export function Welcome() {
  const { profiles, selectProfile } = useStore();
  const [adding, setAdding] = useState(profiles.length === 0);

  return (
    <main className="ambient mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pt-safe pb-safe">
      <p className="text-center text-xs font-light uppercase tracking-[0.3em] text-hue">Daily Affirmations</p>
      <h1 className="mt-3 text-center text-3xl font-light">{adding ? 'Who’s this?' : 'Who’s reading today?'}</h1>

      {adding ? (
        <div className="mt-10 animate-rise">
          <ProfileForm submitLabel="Get started" onDone={() => setAdding(false)} onCancel={profiles.length ? () => setAdding(false) : undefined} />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 animate-rise">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => selectProfile(p.id)}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl bg-surface transition active:scale-95"
            >
              <span className="text-5xl">{p.emoji}</span>
              <span className="text-[15px] font-medium">{p.name}</span>
            </button>
          ))}
          <button
            onClick={() => setAdding(true)}
            className={cx(
              'flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-line text-muted transition active:scale-95',
              profiles.length % 2 === 0 ? 'col-span-2 h-20 flex-row' : 'aspect-square',
            )}
          >
            <span className="text-2xl font-light">+</span>
            <span className="text-sm">Add someone</span>
          </button>
        </div>
      )}
    </main>
  );
}
