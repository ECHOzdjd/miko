export interface Post {
  id: number;
  author: {
    id: number;
    nickname: string;
    avatar_url: string;
    is_verified: boolean;
  };
  title: string;
  content: string;
  post_type: 'text' | 'image' | 'video' | 'article';
  status: 'draft' | 'published' | 'hidden' | 'deleted';
  images: string[];
  video_url: string;
  video_thumbnail: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  bookmarks_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  post_type: 'text' | 'image' | 'video' | 'article';
  images: File[];
}

export interface PostFilters {
  post_type?: string;
  author_id?: number;
  search?: string;
  ordering?: string;
}
