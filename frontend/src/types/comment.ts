export interface Comment {
  id: number;
  post: number;
  author: {
    id: number;
    nickname: string;
    avatar_url: string;
  };
  content: string;
  parent: number | null;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
  parent?: number | null;
}