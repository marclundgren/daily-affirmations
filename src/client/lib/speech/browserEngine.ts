import { MicrophoneBlockedError, type SpeechEngine, type Transcriber, type TranscriberOptions } from './types';

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
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

const Recognition: RecognitionCtor | undefined =
  typeof window === 'undefined' ? undefined : ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition);

const ERRORS: Record<string, string> = {
  'service-not-allowed': 'Speech recognition isn’t available in this browser.',
  'audio-capture': 'No microphone found.',
  network: 'Speech recognition needs a network connection.',
};

/** The browser's built-in recognizer (Safari sends audio to Apple, Chrome to Google). */
export const browserEngine: SpeechEngine | null = Recognition
  ? {
      id: 'browser',
      async start({ onText, onError }: TranscriberOptions): Promise<Transcriber> {
        let active = true;
        const rec = new Recognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = navigator.language || 'en-US';

        rec.onresult = ({ resultIndex, results }) => {
          let interim = '';
          for (let i = resultIndex; i < results.length; i++) {
            const { isFinal, 0: alt } = results[i];
            if (isFinal) onText(alt.transcript, true);
            else interim += ` ${alt.transcript}`;
          }
          if (interim) onText(interim, false);
        };
        rec.onerror = ({ error }) => {
          if (error === 'no-speech' || error === 'aborted') return;
          active = false;
          onError(error === 'not-allowed' ? new MicrophoneBlockedError() : new Error(ERRORS[error] ?? 'Speech recognition stopped unexpectedly.'));
        };
        // Mobile browsers end sessions after a pause; keep listening until stopped.
        rec.onend = () => {
          if (!active) return;
          try {
            rec.start();
          } catch {
            active = false;
            onError(new Error('Speech recognition stopped unexpectedly.'));
          }
        };

        rec.start();
        return {
          stop() {
            active = false;
            rec.abort();
          },
        };
      },
    }
  : null;
