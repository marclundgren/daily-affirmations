import type { User, Affirmation, Completion } from './types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  // Users
  getUsers: () => fetchJson<User[]>('/api/users'),
  createUser: (name: string, avatar_emoji?: string) =>
    fetchJson<User>('/api/users', { method: 'POST', body: JSON.stringify({ name, avatar_emoji }) }),

  // Affirmations
  getAffirmations: () => fetchJson<Affirmation[]>('/api/affirmations'),
  getTodayAffirmations: () => fetchJson<Affirmation[]>('/api/affirmations/today'),
  createAffirmation: (data: Partial<Affirmation>) =>
    fetchJson<Affirmation>('/api/affirmations', { method: 'POST', body: JSON.stringify(data) }),
  updateAffirmation: (id: number, data: Partial<Affirmation>) =>
    fetchJson<Affirmation>(`/api/affirmations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAffirmation: (id: number) =>
    fetchJson<{ success: boolean }>(`/api/affirmations/${id}`, { method: 'DELETE' }),
  reorderAffirmations: (order: number[]) =>
    fetchJson<{ success: boolean }>('/api/affirmations/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    }),

  // Completions
  getCompletions: (userId: number, date: string) =>
    fetchJson<Completion[]>(`/api/completions?user_id=${userId}&date=${date}`),
  markComplete: (userId: number, affirmationId: number) =>
    fetchJson<Completion>('/api/completions', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, affirmation_id: affirmationId }),
    }),
  undoComplete: (completionId: number) =>
    fetchJson<{ success: boolean }>(`/api/completions/${completionId}`, { method: 'DELETE' }),

  // Extract affirmation from image
  extractFromImage: async (file: File): Promise<{ title: string; body: string; error?: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/extract-affirmation', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
};
