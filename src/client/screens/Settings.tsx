import { useState } from 'react';
import { useStore } from '../lib/store';
import { usePrefs } from '../lib/prefs';
import { useSpeechEngines } from '../lib/speech/useFollowAlong';
import { deviceSupported } from '../lib/speech/deviceEngine';
import { useVoiceStatus } from '../lib/speech/useVoiceStatus';
import { ProfileForm } from '../components/ProfileForm';
import { Button, Screen, Section, Segmented, Toggle } from '../components/ui';

export function Settings() {
  const { profile, profiles, selectProfile, deleteProfile } = useStore();
  const [prefs, setPrefs] = usePrefs();
  const [editing, setEditing] = useState(false);
  const engines = useSpeechEngines();
  const others = profiles.filter(p => p.id !== profile?.id);

  const remove = async () => {
    if (profile && confirm(`Remove ${profile.name}? Their reading history will be deleted.`)) await deleteProfile(profile.id);
  };

  return (
    <Screen title="Settings">
      <Section title="You">
        {editing ? (
          <div className="rounded-3xl bg-surface p-4">
            <ProfileForm profile={profile!} submitLabel="Save" onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-3xl bg-surface p-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-3xl">{profile?.emoji}</span>
            <span className="flex-1 text-lg font-medium">{profile?.name}</span>
            <Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        )}
      </Section>

      <Section title="Switch person" footer="Each person has their own progress. Everyone shares the same library.">
        <div className="space-y-2">
          {others.map(p => (
            <button key={p.id} onClick={() => selectProfile(p.id)} className="flex w-full items-center gap-4 rounded-2xl bg-surface px-4 py-3 text-left active:opacity-70">
              <span className="text-2xl">{p.emoji}</span>
              <span className="flex-1">{p.name}</span>
            </button>
          ))}
          <Button variant="secondary" className="w-full" onClick={() => selectProfile(null)}>
            {others.length ? 'Add or switch person' : 'Add a person'}
          </Button>
        </div>
      </Section>

      <Section title="Appearance">
        <Segmented
          value={prefs.theme}
          onChange={theme => setPrefs({ theme })}
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
      </Section>

      <Section
        title="Reading aloud"
        footer={
          engines.length
            ? 'The mic follows your voice word by word. You can always tap ✓ instead.'
            : window.isSecureContext
              ? 'This browser can’t use the microphone here. Read aloud, then tap “I said it”.'
              : 'The microphone only works over HTTPS. Open the app through its https:// address to read aloud.'
        }
      >
        {deviceSupported && (
          <div className="mb-3">
            <Toggle
              label="Private on-device voice"
              description="Speech is recognized on this device and audio never leaves it. One-time 40 MB download."
              checked={prefs.onDeviceVoice}
              onChange={onDeviceVoice => setPrefs({ onDeviceVoice })}
            />
            {prefs.onDeviceVoice && <VoiceModelStatus />}
          </div>
        )}
        <Toggle
          label="Move on automatically"
          description="Go to the next affirmation after you finish reading one aloud"
          checked={prefs.autoAdvance}
          onChange={autoAdvance => setPrefs({ autoAdvance })}
        />
      </Section>

      {profiles.length > 1 && (
        <Section title="Danger zone">
          <Button variant="danger" className="w-full" onClick={remove}>
            Remove {profile?.name}
          </Button>
        </Section>
      )}
    </Screen>
  );
}

function VoiceModelStatus() {
  const status = useVoiceStatus();
  const text = {
    idle: 'The voice model downloads in the background.',
    saved: 'Voice model saved on this device.',
    downloading: status.state === 'downloading' ? `Downloading voice model… ${Math.round(status.progress * 100)}%` : '',
    loading: 'Loading voice model…',
    ready: 'Voice model ready.',
    error: status.state === 'error' ? `Voice model unavailable (${status.message}). Using your browser’s recognition instead.` : '',
  }[status.state];
  return <p className="mt-2 px-1 text-xs text-faint">{text}</p>;
}
