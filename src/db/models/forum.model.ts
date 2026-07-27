export interface Forum {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: Date;
}

export interface Post {
  id: string;
  user_id: string;
  forum_id: string | null;
  body: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostWithAuthor extends Post {
  author_name: string;
  vote_score: number;
  comment_count: number;
}
