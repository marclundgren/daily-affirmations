export interface User {
  id: number;
  name: string;
  avatar_emoji: string;
  created_at: string;
}

export interface Affirmation {
  id: number;
  title: string;
  body: string;
  cadence: 'daily' | 'weekly' | 'monthly';
  schedule_day: number | null;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: number;
  user_id: number;
  affirmation_id: number;
  completed_date: string;
  completed_at: string;
}
