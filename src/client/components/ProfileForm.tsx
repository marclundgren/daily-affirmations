import { useState, type FormEvent } from 'react';
import type { Profile } from '../../shared/types';
import { useStore } from '../lib/store';
import { Button, cx } from './ui';

const EMOJI = ['✨', '🌙', '🌸', '🌿', '🔥', '🌊', '☀️', '🦋', '💜', '🕊️', '🌻', '⭐'];

export function ProfileForm({ profile, submitLabel, onDone, onCancel }: { profile?: Profile; submitLabel: string; onDone: () => void; onCancel?: () => void }) {
  const { saveProfile } = useStore();
  const [name, setName] = useState(profile?.name ?? '');
  const [emoji, setEmoji] = useState(profile?.emoji ?? EMOJI[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveProfile({ id: profile?.id, name: name.trim(), emoji });
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        autoFocus={!profile}
        maxLength={40}
        className="h-14 w-full rounded-2xl bg-surface px-5 text-lg outline-none placeholder:text-faint focus:ring-2 focus:ring-accent"
      />
      <div className="grid grid-cols-6 gap-2">
        {EMOJI.map(e => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            aria-pressed={emoji === e}
            className={cx('grid aspect-square place-items-center rounded-2xl text-2xl transition active:scale-90', emoji === e ? 'bg-surface-2 ring-2 ring-accent' : 'bg-surface')}
          >
            {e}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={!name.trim() || busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
