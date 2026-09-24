import { useState } from 'react';
import { useStore } from '../lib/store';
import { usePrefs } from '../lib/prefs';
import { speechSupported } from '../lib/useFollowAlong';
import { ProfileForm } from '../components/ProfileForm';
import { Button, Screen, Section, Segmented, Toggle } from '../components/ui';

export function Settings() {
  const { profile, profiles, selectProfile, deleteProfile } = useStore();
  const [prefs, setPrefs] = usePrefs();
  const [editing, setEditing] = useState(false);
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
          speechSupported
            ? 'The mic follows your voice word by word. Audio is handled by your browser’s speech recognition.'
            : 'This browser doesn’t support speech recognition. Try Safari on iPhone or Chrome.'
        }
      >
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
