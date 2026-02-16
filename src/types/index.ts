export type Feature = 'Lights' | 'Music' | 'Strobes' | 'Animatronics' | 'Blowups';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface House {
  id: string;
  user_id: string;
  address: string;
  lat: number;
  lng: number;
  zip_code?: string;
  description: string | null;
  features: Feature[];
  photos: string[];
  season_year: number;
  is_active: boolean;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined from house_stats view
  avg_rating?: number;
  rating_count?: number;
  // Voting
  votes: number;
  local_rank: number | null;
  national_rank: number | null;
}

export interface Rating {
  id: string;
  house_id: string;
  user_id: string;
  score: number; // 1.0 - 5.0, step 0.5
  created_at: string;
}

export interface Review {
  id: string;
  house_id: string;
  user_id: string;
  body: string;
  is_flagged: boolean;
  created_at: string;
}

export interface Route {
  id: string;
  user_id: string;
  name: string;
  house_ids: string[];
  duration_minutes: number | null;
  distance_km: number | null;
  polyline: string | null;
  is_public: boolean;
  created_at: string;
}
