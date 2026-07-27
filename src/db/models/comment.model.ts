export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author_name: string;
  vote_score: number;
}
