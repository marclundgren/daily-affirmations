import { useEffect, useSyncExternalStore } from 'react';
import { usePrefs } from '../prefs';
import { deviceSupported, loadModel, prefetchModel, voiceStatus } from './deviceEngine';

export function useVoiceStatus() {
  return useSyncExternalStore(voiceStatus.subscribe, voiceStatus.get);
}

/**
 * Gets on-device recognition ready in the background: `download` fetches the model into the
 * cache once (on first visit); `load` also initializes it (when the reader opens).
 */
export function useVoicePreload(mode: 'download' | 'load') {
  const [{ onDeviceVoice }] = usePrefs();
  useEffect(() => {
    if (!onDeviceVoice || !deviceSupported) return;
    const run = () => (mode === 'load' ? loadModel() : prefetchModel()).catch(() => {});
    // Wait until the app is idle so the download never competes with the first paint.
    const handle = 'requestIdleCallback' in window ? requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1500);
    return () => ('cancelIdleCallback' in window ? cancelIdleCallback(handle as number) : clearTimeout(handle));
  }, [mode, onDeviceVoice]);
}
