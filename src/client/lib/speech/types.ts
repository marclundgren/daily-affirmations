/**
 * A running speech recognizer. Engines report text one segment at a time: `onText(text, false)`
 * with the segment so far (it may be revised), then `onText(text, true)` once the segment is
 * settled — typically when the speaker pauses. The next segment starts empty.
 */
export interface Transcriber {
  stop(): void;
}

export interface TranscriberOptions {
  /** Words the reader is expected to say; engines may use them to focus recognition. */
  words: string[];
  onText(text: string, isFinal: boolean): void;
  /** A problem that ends the session, e.g. a MicrophoneBlockedError. */
  onError(error: Error): void;
}

export interface SpeechEngine {
  id: 'device' | 'browser';
  start(options: TranscriberOptions): Promise<Transcriber>;
}

/** The user (or browser) refused microphone access — no other engine will fare better. */
export class MicrophoneBlockedError extends Error {
  constructor() {
    super('Microphone access is blocked. Allow it in your browser settings.');
  }
}
