export interface User {
  id: number;
  email: string;
  nickname: string;
  avatar_url: string;
  background_url: string;
  signature: string;
  bio: string;
  birthday: string | null;
  gender: 'male' | 'female' | 'other' | '';
  location: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  likes_received: number;
  last_active: string;
  created_at: string;
  is_following?: boolean;
  is_followed_by?: boolean;
}

export interface UserProfile {
  id: number;
  user: User;
  interests: string[];
  favorite_anime: string[];
  favorite_manga: string[];
  favorite_games: string[];
  social_links: Record<string, string>;
  privacy_settings: Record<string, any>;
  notification_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
