import { useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { AffirmationInput, Cadence } from '../../shared/types';
import { parseDocument } from '../../shared/markdown';
import { WEEKDAYS } from '../../shared/schedule';
import { api } from '../lib/api';
import { useStore } from '../lib/store';
import { AffirmationText } from '../components/AffirmationText';
import { Icon, type IconName } from '../components/Icon';
import { Button, Chip, Screen, Section, Segmented, Toggle, cx } from '../components/ui';

const EMPTY: AffirmationInput = { title: '', body: '', cadence: 'daily', days: [], archived: false };

const TEMPLATE = `Say:

> I am calm, capable and ready for today.

What you practice **grows stronger.**`;

export function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { affirmations, saveAffirmation, deleteAffirmation, config, hueOf } = useStore();
  const existing = id ? affirmations.find(a => a.id === Number(id)) : undefined;

  const [draft, setDraft] = useState<AffirmationInput>(() => {
    if (!existing) return EMPTY;
    const { title, body, cadence, days, archived } = existing;
    return { title, body, cadence, days, archived };
  });
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState<'saving' | 'importing' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const doc = useMemo(() => parseDocument(draft.body), [draft.body]);

  if (id && !existing) return <Screen title="Not found" tabs={false}><p className="mt-10 text-center text-muted">This affirmation no longer exists.</p></Screen>;

  const update = (patch: Partial<AffirmationInput>) => setDraft(d => ({ ...d, ...patch }));

  const setCadence = (cadence: Cadence) => {
    const days = cadence === 'weekly' ? [new Date().getDay()] : cadence === 'monthly' ? [1] : [];
    update({ cadence, days: cadence === draft.cadence ? draft.days : days });
  };

  const toggleDay = (day: number) =>
    update({ days: draft.days.includes(day) ? draft.days.filter(d => d !== day) : [...draft.days, day] });

  /** Applies a markdown helper to the selected lines (or selected text, for highlight). */
  const format = (kind: 'quote' | 'bold' | 'list') => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    let next: string;
    if (kind === 'bold') {
      const selected = value.slice(start, end) || 'highlight';
      next = `${value.slice(0, start)}**${selected}**${value.slice(end)}`;
    } else {
      const prefix = kind === 'quote' ? '> ' : '- ';
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lines = value.slice(lineStart, end).split('\n');
      const allPrefixed = lines.every(l => l.startsWith(prefix));
      const changed = lines.map(l => (allPrefixed ? l.slice(prefix.length) : l.startsWith(prefix) ? l : prefix + l)).join('\n');
      next = value.slice(0, lineStart) + changed + value.slice(end);
    }
    update({ body: next });
    requestAnimationFrame(() => el.focus());
  };

  const importImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('importing');
    setError(null);
    try {
      const { title, body } = await api.importImage(file);
      update({ title, body });
      setTab('preview');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('saving');
    setError(null);
    try {
      await saveAffirmation(existing?.id ?? null, draft);
      navigate('/library');
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!existing || !confirm(`Delete “${existing.title}”? This also removes its reading history.`)) return;
    await deleteAffirmation(existing.id);
    navigate('/library', { replace: true });
  };

  const scheduleIncomplete = draft.cadence !== 'daily' && draft.days.length === 0;
  const canSave = draft.title.trim() && draft.body.trim() && !scheduleIncomplete && !busy;

  return (
    <Screen
      tabs={false}
      title={existing ? 'Edit' : 'New affirmation'}
      leading={<Button variant="ghost" className="px-3" onClick={() => navigate(-1)}>Cancel</Button>}
      trailing={<Button className="h-9 px-4 text-sm" disabled={!canSave} onClick={save}>{busy === 'saving' ? 'Saving…' : 'Save'}</Button>}
    >
      {config.imageImport && (
        <label className={cx('mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 py-3.5', busy === 'importing' && 'pointer-events-none opacity-60')}>
          <Icon name="image" className="size-5 text-accent" />
          <span className="flex-1">
            <span className="block text-[15px]">{busy === 'importing' ? 'Reading image…' : 'Import from a screenshot'}</span>
            <span className="block text-xs text-faint">Claude transcribes it into the fields below</span>
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={importImage} />
        </label>
      )}

      {error && <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

      <Section title="Title">
        <input
          value={draft.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="Invite Divine Guidance"
          className="h-13 w-full rounded-2xl bg-surface px-4 text-[17px] outline-none placeholder:text-faint focus:ring-2 focus:ring-accent"
        />
      </Section>

      <Section
        title="Affirmation"
        footer={
          <>
            Mark the words you say aloud as a <b>quote</b> — the mic follows along with those. <b>Highlighted</b> words glow.
          </>
        }
      >
        <div className="mb-2 flex items-center gap-2">
          <Segmented value={tab} onChange={setTab} options={[{ value: 'write', label: 'Write' }, { value: 'preview', label: 'Preview' }]} />
          {tab === 'write' && (
            <div className="ml-auto flex gap-1">
              {(
                [
                  ['quote', 'quote', 'Say aloud'],
                  ['bold', 'bold', 'Highlight'],
                  ['list', 'list', 'List'],
                ] as [('quote' | 'bold' | 'list'), IconName, string][]
              ).map(([kind, icon, label]) => (
                <button key={kind} type="button" onClick={() => format(kind)} aria-label={label} title={label} className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted active:scale-90">
                  <Icon name={icon} className="size-4" />
                </button>
              ))}
            </div>
          )}
        </div>
        {tab === 'write' ? (
          <textarea
            ref={bodyRef}
            value={draft.body}
            onChange={e => update({ body: e.target.value })}
            placeholder={TEMPLATE}
            rows={9}
            className="w-full resize-y rounded-2xl bg-surface p-4 text-[15px] leading-relaxed outline-none placeholder:text-faint focus:ring-2 focus:ring-accent"
          />
        ) : (
          <div className="ambient min-h-52 rounded-2xl border border-line px-5 py-7 text-center" style={{ '--hue': existing ? hueOf(existing.id) : 290 } as CSSProperties}>
            {draft.title && <h3 className="mb-5 text-sm font-light uppercase tracking-[0.15em] text-hue">{draft.title}</h3>}
            {draft.body.trim() ? <AffirmationText doc={doc} size="compact" /> : <p className="text-sm text-faint">Nothing to preview yet.</p>}
          </div>
        )}
      </Section>

      <Section title="Schedule" footer={scheduleIncomplete ? `Pick at least one day.` : undefined}>
        <Segmented
          value={draft.cadence}
          onChange={setCadence}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
        {draft.cadence === 'weekly' && (
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((label, day) => (
              <Chip key={day} selected={draft.days.includes(day)} onClick={() => toggleDay(day)}>
                {label.slice(0, 2)}
              </Chip>
            ))}
          </div>
        )}
        {draft.cadence === 'monthly' && (
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <Chip key={day} selected={draft.days.includes(day)} onClick={() => toggleDay(day)}>
                {day}
              </Chip>
            ))}
          </div>
        )}
      </Section>

      {existing && (
        <Section title="Options" footer="Paused affirmations stay in your library but don’t show up on Today.">
          <Toggle label="Paused" checked={draft.archived} onChange={archived => update({ archived })} />
          <Button variant="danger" className="mt-6 w-full" onClick={remove}>
            <Icon name="trash" className="size-4" /> Delete affirmation
          </Button>
        </Section>
      )}
    </Screen>
  );
}
