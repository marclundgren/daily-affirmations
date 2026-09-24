import { useCallback, useEffect, useRef, useState } from 'react';
import { advance } from '../../shared/follow';

// The Web Speech API isn't in TypeScript's DOM lib yet; this is the slice we use.
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

const Recognition: RecognitionCtor | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition);

export const speechSupported = Recognition !== undefined;

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings.',
  'service-not-allowed': 'Speech recognition isn’t available in this browser.',
  'audio-capture': 'No microphone found.',
  network: 'Speech recognition needs a network connection.',
};

/**
 * Listens to the microphone and tracks how far through `targets` the reader has spoken.
 * `onComplete` fires once when the last word is reached.
 */
export function useFollowAlong(targets: string[], onComplete: () => void) {
  const [cursor, setCursor] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognition = useRef<Recognition | null>(null);
  const wanted = useRef(false);
  const committed = useRef(0);
  const shown = useRef(0);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const stop = useCallback(() => {
    wanted.current = false;
    recognition.current?.abort();
    recognition.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!Recognition || recognition.current) return;
    setError(null);
    wanted.current = true;

    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';

    rec.onresult = ({ resultIndex, results }) => {
      let live = committed.current;
      for (let i = resultIndex; i < results.length; i++) {
        const { isFinal, 0: alt } = results[i];
        if (isFinal) live = committed.current = advance(targets, committed.current, alt.transcript);
        else live = advance(targets, live, alt.transcript);
      }
      // Never move backwards on screen when an interim guess is revised.
      shown.current = Math.max(shown.current, live);
      setCursor(shown.current);
      if (shown.current >= targets.length) {
        stop();
        completeRef.current();
      }
    };
    rec.onerror = ({ error }) => {
      if (error === 'no-speech' || error === 'aborted') return;
      setError(ERRORS[error] ?? 'Speech recognition stopped unexpectedly.');
      wanted.current = false;
    };
    // Mobile browsers end sessions after a pause; keep listening until asked to stop.
    rec.onend = () => {
      if (wanted.current && recognition.current === rec) {
        try {
          rec.start();
          return;
        } catch {
          // Fall through to stopped.
        }
      }
      if (recognition.current === rec) recognition.current = null;
      setListening(false);
    };

    try {
      rec.start();
      recognition.current = rec;
      setListening(true);
    } catch {
      setError('Couldn’t start the microphone.');
    }
  }, [targets, stop]);

  useEffect(() => stop, [stop]);

  return { cursor, listening, error, start, stop, supported: speechSupported };
}
