import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Affirmation, AffirmationInput, Profile, ServerConfig } from '../../shared/types';
import { addDays, dayKey, isDue, parseDay, streak } from '../../shared/schedule';
import { api } from './api';
import { usePrefs } from './prefs';
import { loadCompletedDays, saveCompletedDay } from './completedDays';

const HISTORY_DAYS = 120;
const readingKey = (day: string, affirmationId: number) => `${day}|${affirmationId}`;

/** Spreads affirmations across a blue → violet → pink → peach spectrum, in list order. */
function spectrum(affirmations: Affirmation[]): Map<number, number> {
  const last = Math.max(affirmations.length - 1, 1);
  return new Map(affirmations.map((a, i) => [a.id, 260 + 150 * (i / last) ** 1.5]));
}

function useToday(): string {
  const [today, setToday] = useState(() => dayKey(new Date()));
  useEffect(() => {
    const check = () => setToday(dayKey(new Date()));
    const timer = setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return today;
}

function useStoreValue() {
  const [prefs, setPrefs] = usePrefs();
  const today = useToday();
  const [config, setConfig] = useState<ServerConfig>({ imageImport: false });
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [affirmations, setAffirmations] = useState<Affirmation[] | null>(null);
  const [readings, setReadings] = useState<Set<string>>(new Set());
  // Which profile `readings` belongs to, so screens don't flash another person's (or empty) progress.
  const [readingsFor, setReadingsFor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profile = profiles?.find(p => p.id === prefs.profileId) ?? null;
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  useEffect(() => setCompletedDays(profile ? loadCompletedDays(profile.id) : new Set()), [profile?.id]);

  useEffect(() => {
    Promise.all([api.config(), api.profiles(), api.affirmations()])
      .then(([c, p, a]) => {
        setConfig(c);
        setProfiles(p);
        setAffirmations(a);
      })
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!profile) return;
    api
      .readings(profile.id, addDays(today, -HISTORY_DAYS))
      .then(rs => {
        setReadings(new Set(rs.map(r => readingKey(r.day, r.affirmationId))));
        setReadingsFor(profile.id);
      })
      .catch(err => setError(err.message));
  }, [profile?.id, today]);

  const setRead = useCallback(
    (affirmationId: number, read: boolean) => {
      if (!profile) return;
      const key = readingKey(today, affirmationId);
      const apply = (on: boolean) =>
        setReadings(prev => {
          const next = new Set(prev);
          if (on) next.add(key);
          else next.delete(key);
          return next;
        });
      apply(read);
      api.setReading(profile.id, today, affirmationId, read).catch(err => {
        apply(!read);
        setError(err.message);
      });
    },
    [profile, today],
  );

  const saveAffirmation = useCallback(async (id: number | null, input: AffirmationInput) => {
    const saved = id === null ? await api.createAffirmation(input) : await api.updateAffirmation(id, input);
    setAffirmations(prev => (id === null ? [...(prev ?? []), saved] : (prev ?? []).map(a => (a.id === id ? saved : a))));
    return saved;
  }, []);

  const deleteAffirmation = useCallback(async (id: number) => {
    await api.deleteAffirmation(id);
    setAffirmations(prev => (prev ?? []).filter(a => a.id !== id));
  }, []);

  const reorder = useCallback((ordered: Affirmation[]) => {
    const previous = affirmations;
    setAffirmations(ordered);
    api.reorder(ordered.map(a => a.id)).catch(err => {
      setAffirmations(previous);
      setError(err.message);
    });
  }, [affirmations]);

  const saveProfile = useCallback(
    async (input: Omit<Profile, 'id'> & { id?: number }) => {
      const saved = input.id ? await api.updateProfile(input as Profile) : await api.createProfile(input);
      setProfiles(prev => (input.id ? (prev ?? []).map(p => (p.id === saved.id ? saved : p)) : [...(prev ?? []), saved]));
      if (!input.id) setPrefs({ profileId: saved.id });
      return saved;
    },
    [setPrefs],
  );

  const deleteProfile = useCallback(
    async (id: number) => {
      await api.deleteProfile(id);
      setProfiles(prev => (prev ?? []).filter(p => p.id !== id));
      if (prefs.profileId === id) setPrefs({ profileId: null });
    },
    [prefs.profileId, setPrefs],
  );

  const derived = useMemo(() => {
    const list = affirmations ?? [];
    const due = list.filter(a => isDue(a, parseDay(today)));
    const isRead = (id: number) => readings.has(readingKey(today, id));
    return {
      hues: spectrum(list.filter(a => !a.archived)),
      due,
      isRead,
      doneCount: due.filter(a => isRead(a.id)).length,
    };
  }, [affirmations, readings, today]);

  // Record today as completed (or not) whenever today's progress changes.
  const loadedFor = profile && readingsFor === profile.id ? profile.id : null;
  const todayComplete = derived.due.length > 0 && derived.doneCount === derived.due.length;
  useEffect(() => {
    if (loadedFor === null || completedDays.has(today) === todayComplete) return;
    setCompletedDays(saveCompletedDay(loadedFor, today, todayComplete));
  }, [loadedFor, today, todayComplete, completedDays]);

  return {
    ready: profiles !== null && affirmations !== null && (!profile || readingsFor === profile.id),
    error,
    clearError: () => setError(null),
    config,
    today,
    profiles: profiles ?? [],
    profile,
    selectProfile: (profileId: number | null) => setPrefs({ profileId }),
    saveProfile,
    deleteProfile,
    affirmations: affirmations ?? [],
    saveAffirmation,
    deleteAffirmation,
    reorder,
    setRead,
    hueOf: (id: number) => derived.hues.get(id) ?? 290,
    completedDays,
    streak: streak(completedDays, today),
    ...derived,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={useStoreValue()}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
