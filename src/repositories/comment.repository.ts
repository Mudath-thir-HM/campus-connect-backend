import { sql } from "../db/client";
import { toIso } from "../utils/serialize";
import type { Comment, CommentWithAuthor } from "../db/models/comment.model";

function serializeComment<T extends { created_at: any; vote_score?: any }>(
  row: T,
): T {
  return {
    ...row,
    created_at: toIso(row.created_at),
    ...(row.vote_score !== undefined
      ? { vote_score: Number(row.vote_score) }
      : {}),
  };
}

export const commentRepository = {
  async create(
    postId: string,
    userId: string,
    body: string,
    parentCommentId: string | null,
  ): Promise<Comment> {
    const [comment] = await sql`
      INSERT INTO comments (post_id, user_id, parent_comment_id, body)
      VALUES (${postId}, ${userId}, ${parentCommentId}, ${body})
      RETURNING *
    `;
    return serializeComment(comment) as Comment;
  },

  async findById(id: string): Promise<Comment | null> {
    const [comment] = await sql`SELECT * FROM comments WHERE id = ${id}`;
    return comment ? (serializeComment(comment) as Comment) : null;
  },

  // flat list for a post — nesting happens in the service layer
  async listByPost(postId: string): Promise<CommentWithAuthor[]> {
    const rows = await sql`
      SELECT c.*, u.full_name AS author_name,
        COALESCE((SELECT SUM(value) FROM comment_votes WHERE comment_id = c.id), 0) AS vote_score
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `;
    return rows.map(serializeComment) as CommentWithAuthor[];
  },

  async delete(id: string, userId: string): Promise<void> {
    await sql`DELETE FROM comments WHERE id = ${id} AND user_id = ${userId}`;
  },
};
