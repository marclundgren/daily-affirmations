import type { Model } from 'vosk-browser';
import { MicrophoneBlockedError, type SpeechEngine, type Transcriber, type TranscriberOptions } from './types';

/**
 * On-device recognition with Vosk (Kaldi compiled to WebAssembly). Audio never leaves the device.
 * The ~40 MB model is downloaded once into Cache Storage, then loaded from there.
 */

const MODEL_URL = '/voice/vosk-model-small-en-us-0.15.tar.gz';
const CACHE_NAME = 'voice-models-v1';

export type VoiceStatus =
  | { state: 'idle' }
  | { state: 'downloading'; progress: number }
  | { state: 'saved' }
  | { state: 'loading' }
  | { state: 'ready' }
  | { state: 'error'; message: string };

export const deviceSupported =
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'caches' in window &&
  typeof WebAssembly === 'object' &&
  !!navigator.mediaDevices?.getUserMedia;

// --- Status, observable from React via useSyncExternalStore --------------------------------

let status: VoiceStatus = { state: 'idle' };
const listeners = new Set<() => void>();

function setStatus(next: VoiceStatus) {
  status = next;
  listeners.forEach(l => l());
}

export const voiceStatus = {
  get: () => status,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// --- Model download and loading --------------------------------------------------------------

async function download(cache: Cache): Promise<Response> {
  const res = await fetch(MODEL_URL);
  if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`);
  const total = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    setStatus({ state: 'downloading', progress: total ? received / total : 0 });
  }
  await cache.put(MODEL_URL, new Response(new Blob(chunks as BlobPart[]), { headers: { 'Content-Type': 'application/gzip' } }));
  // Ask the browser not to evict the model under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
  return (await cache.match(MODEL_URL))!;
}

let downloading: Promise<Response> | null = null;

/** Makes sure the model is in Cache Storage. Cheap when it already is. */
export function prefetchModel(): Promise<Response> {
  downloading ??= (async () => {
    const cache = await caches.open(CACHE_NAME);
    const res = (await cache.match(MODEL_URL)) ?? (setStatus({ state: 'downloading', progress: 0 }), await download(cache));
    setStatus({ state: 'saved' });
    return res;
  })().catch(err => {
    downloading = null;
    setStatus({ state: 'error', message: (err as Error).message });
    throw err;
  });
  return downloading;
}

let loading: Promise<Model> | null = null;

/** Downloads (if needed) and initializes the model. Shared by every recognizer. */
export function loadModel(): Promise<Model> {
  loading ??= (async () => {
    const res = await prefetchModel();
    setStatus({ state: 'loading' });
    const [{ createModel }, blob] = await Promise.all([import('vosk-browser'), res.clone().blob()]);
    const url = URL.createObjectURL(blob);
    try {
      const model = await createModel(url);
      setStatus({ state: 'ready' });
      return model;
    } finally {
      URL.revokeObjectURL(url);
    }
  })().catch(err => {
    loading = null;
    setStatus({ state: 'error', message: (err as Error).message });
    throw err;
  });
  return loading;
}

// --- Recognition -------------------------------------------------------------------------------

const cleanText = (text: string) => text.replace(/\[unk\]/g, ' ').trim();

export const deviceEngine: SpeechEngine | null = deviceSupported
  ? {
      id: 'device',
      async start({ words, onText, onError }: TranscriberOptions): Promise<Transcriber> {
        // iOS only allows audio to start during the tap, so create the context before awaiting anything.
        const audio = new AudioContext();
        const stream = await navigator.mediaDevices
          .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } })
          .catch(() => {
            audio.close();
            throw new MicrophoneBlockedError();
          });
        await audio.resume();

        let model: Model;
        try {
          model = await loadModel();
        } catch (err) {
          stream.getTracks().forEach(t => t.stop());
          audio.close();
          throw err;
        }

        // Restricting recognition to the expected words (plus "[unk]" for anything else)
        // makes it far more accurate for reading a known script.
        const grammar = JSON.stringify([...new Set(words), '[unk]']);
        const recognizer = new model.KaldiRecognizer(audio.sampleRate, grammar);
        recognizer.on('partialresult', m => {
          if (m.event === 'partialresult') onText(cleanText(m.result.partial), false);
        });
        recognizer.on('result', m => {
          if (m.event === 'result') onText(cleanText(m.result.text), true);
        });
        recognizer.on('error', m => {
          if (m.event === 'error') onError(new Error('On-device recognition stopped unexpectedly.'));
        });

        // ScriptProcessorNode is deprecated but is the one audio tap every browser (incl. iOS) supports.
        const source = audio.createMediaStreamSource(stream);
        const tap = audio.createScriptProcessor(4096, 1, 1);
        tap.onaudioprocess = e => recognizer.acceptWaveform(e.inputBuffer);
        source.connect(tap);
        tap.connect(audio.destination);

        return {
          stop() {
            tap.disconnect();
            source.disconnect();
            stream.getTracks().forEach(t => t.stop());
            audio.close();
            recognizer.remove();
          },
        };
      },
    }
  : null;
