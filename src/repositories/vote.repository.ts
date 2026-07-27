import { sql } from "../db/client";

export const voteRepository = {
  async upsertPostVote(
    userId: string,
    postId: string,
    value: 1 | -1,
  ): Promise<void> {
    await sql`
      INSERT INTO post_votes (user_id, post_id, value)
      VALUES (${userId}, ${postId}, ${value})
      ON CONFLICT (user_id, post_id) DO UPDATE SET value = ${value}
    `;
  },
  async removePostVote(userId: string, postId: string): Promise<void> {
    await sql`DELETE FROM post_votes WHERE user_id = ${userId} AND post_id = ${postId}`;
  },

  async upsertCommentVote(
    userId: string,
    commentId: string,
    value: 1 | -1,
  ): Promise<void> {
    await sql`
      INSERT INTO comment_votes (user_id, comment_id, value)
      VALUES (${userId}, ${commentId}, ${value})
      ON CONFLICT (user_id, comment_id) DO UPDATE SET value = ${value}
    `;
  },
  async removeCommentVote(userId: string, commentId: string): Promise<void> {
    await sql`DELETE FROM comment_votes WHERE user_id = ${userId} AND comment_id = ${commentId}`;
  },
};
