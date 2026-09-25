import type { Affirmation, AffirmationInput, Profile, Reading, ServerConfig } from '../../shared/types';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined;
  const res = await fetch(`/api${path}`, { ...init, headers });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  config: () => request<ServerConfig>('/config'),

  profiles: () => request<Profile[]>('/profiles'),
  createProfile: (p: Omit<Profile, 'id'>) => request<Profile>('/profiles', json('POST', p)),
  updateProfile: ({ id, ...p }: Profile) => request<Profile>(`/profiles/${id}`, json('PUT', p)),
  deleteProfile: (id: number) => request<void>(`/profiles/${id}`, { method: 'DELETE' }),

  readings: (profileId: number, since: string) => request<Reading[]>(`/profiles/${profileId}/readings?since=${since}`),
  setReading: (profileId: number, day: string, affirmationId: number, read: boolean) =>
    request<void>(`/profiles/${profileId}/readings/${day}/${affirmationId}`, json('PUT', { read })),

  affirmations: () => request<Affirmation[]>('/affirmations'),
  createAffirmation: (a: AffirmationInput) => request<Affirmation>('/affirmations', json('POST', a)),
  updateAffirmation: (id: number, a: AffirmationInput) => request<Affirmation>(`/affirmations/${id}`, json('PUT', a)),
  deleteAffirmation: (id: number) => request<void>(`/affirmations/${id}`, { method: 'DELETE' }),
  reorder: (ids: number[]) => request<void>('/affirmations/order', json('PUT', { ids })),

  importImage: (image: Blob) => {
    const form = new FormData();
    form.append('image', image);
    return request<Pick<Affirmation, 'title' | 'body'>>('/import', { method: 'POST', body: form });
  },
};
