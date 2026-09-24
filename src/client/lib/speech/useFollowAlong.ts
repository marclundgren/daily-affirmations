import { useCallback, useEffect, useRef, useState } from 'react';
import type { Document } from '../../../shared/markdown';
import { advance, isComplete } from '../../../shared/follow';
import { usePrefs } from '../prefs';
import { browserEngine } from './browserEngine';
import { deviceEngine } from './deviceEngine';
import { MicrophoneBlockedError, type SpeechEngine, type Transcriber } from './types';

export type FollowState = 'idle' | 'starting' | 'listening';

/** Engines to try, best first: on-device when enabled, then the browser's own recognizer. */
export function useSpeechEngines(): SpeechEngine[] {
  const [{ onDeviceVoice }] = usePrefs();
  return [onDeviceVoice ? deviceEngine : null, browserEngine].filter(e => e !== null);
}

/**
 * Listens to the microphone and tracks how far through the document's spoken words the reader
 * has got. `onComplete` fires once when they finish.
 */
export function useFollowAlong(doc: Document, onComplete: () => void) {
  const engines = useSpeechEngines();
  const [cursor, setCursor] = useState(0);
  const [state, setState] = useState<FollowState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [engine, setEngine] = useState<SpeechEngine['id'] | null>(null);

  const session = useRef<Transcriber | null>(null);
  const attempt = useRef(0);
  const committed = useRef(0);
  const shown = useRef(0);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const stop = useCallback(() => {
    attempt.current++;
    session.current?.stop();
    session.current = null;
    setState('idle');
  }, []);

  const onText = useCallback(
    (text: string, isFinal: boolean) => {
      const live = advance(doc.targets, committed.current, text);
      if (isFinal) committed.current = live;
      // Never move backwards on screen when an in-progress guess is revised.
      shown.current = Math.max(shown.current, live);
      setCursor(shown.current);
      if (isComplete(doc.targets, shown.current, isFinal)) {
        // Light every word, including a final one the recognizer may have missed.
        shown.current = doc.targets.length;
        setCursor(shown.current);
        stop();
        completeRef.current();
      }
    },
    [doc, stop],
  );

  /** Must be called from a tap: engines start audio synchronously before their first await. */
  const start = useCallback(async () => {
    if (session.current || !engines.length) return;
    const id = ++attempt.current;
    setError(null);
    setState('starting');

    for (const [i, candidate] of engines.entries()) {
      try {
        const transcriber = await candidate.start({
          words: doc.vocabulary,
          onText: (text, isFinal) => attempt.current === id && onText(text, isFinal),
          onError: err => {
            if (attempt.current !== id) return;
            stop();
            setError(err);
          },
        });
        if (attempt.current !== id) return transcriber.stop(); // Stopped while starting.
        session.current = transcriber;
        setEngine(candidate.id);
        setState('listening');
        return;
      } catch (err) {
        const last = i === engines.length - 1;
        if (err instanceof MicrophoneBlockedError || last || attempt.current !== id) {
          if (attempt.current === id) {
            setState('idle');
            setError(err as Error);
          }
          return;
        }
        console.warn(`${candidate.id} speech engine failed, falling back:`, err);
      }
    }
  }, [engines, doc, onText, stop]);

  useEffect(() => stop, [stop]);

  return {
    cursor,
    state,
    engine,
    error: error?.message ?? null,
    /** No usable microphone: offer a plain "I said it" button instead. */
    unavailable: engines.length === 0 || error instanceof MicrophoneBlockedError,
    start,
    stop,
  };
}
