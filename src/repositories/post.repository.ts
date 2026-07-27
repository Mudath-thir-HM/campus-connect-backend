import { sql } from "../db/client";
import { toIso } from "../utils/serialize";
import type { Post, PostWithAuthor } from "../db/models/forum.model";

function serializePost<
  T extends {
    created_at: any;
    updated_at?: any;
    vote_score?: any;
    comment_count?: any;
  },
>(row: T): T {
  return {
    ...row,
    created_at: toIso(row.created_at),
    ...(row.updated_at ? { updated_at: toIso(row.updated_at) } : {}),
    ...(row.vote_score !== undefined
      ? { vote_score: Number(row.vote_score) }
      : {}),
    ...(row.comment_count !== undefined
      ? { comment_count: Number(row.comment_count) }
      : {}),
  };
}

export const postRepository = {
  async create(
    userId: string,
    forumId: string | null,
    body: string,
  ): Promise<Post> {
    const [post] = await sql`
      INSERT INTO posts (user_id, forum_id, body)
      VALUES (${userId}, ${forumId}, ${body})
      RETURNING *
    `;
    return serializePost(post) as Post;
  },

  async findById(id: string): Promise<Post | null> {
    const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
    return post ? (serializePost(post) as Post) : null;
  },

  async listGeneral(limit = 20, offset = 0): Promise<PostWithAuthor[]> {
    const rows = await sql`
      SELECT p.*, u.full_name AS author_name,
        COALESCE((SELECT SUM(value) FROM post_votes WHERE post_id = p.id), 0)::int AS vote_score,
(SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.forum_id IS NULL
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializePost) as PostWithAuthor[];
  },

  async listByForum(
    forumId: string,
    limit = 20,
    offset = 0,
  ): Promise<PostWithAuthor[]> {
    const rows = await sql`
      SELECT p.*, u.full_name AS author_name,
        COALESCE((SELECT SUM(value) FROM post_votes WHERE post_id = p.id), 0) AS vote_score,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.forum_id = ${forumId}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializePost) as PostWithAuthor[];
  },

  async delete(id: string, userId: string): Promise<void> {
    await sql`DELETE FROM posts WHERE id = ${id} AND user_id = ${userId}`;
  },
};
