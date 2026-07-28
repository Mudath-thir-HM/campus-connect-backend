import { sql } from "../db/client";
import { toIso } from "../utils/serialize";
import type { NewsPost } from "../db/models/content.model";

function serializeNews(row: any): NewsPost {
  return { ...row, created_at: toIso(row.created_at) };
}

export const newsRepository = {
  async create(userId: string, title: string, body: string): Promise<NewsPost> {
    const [row] = await sql`
      INSERT INTO news_posts (user_id, title, body)
      VALUES (${userId}, ${title}, ${body})
      RETURNING *
    `;
    return serializeNews(row);
  },

  async list(limit = 20, offset = 0): Promise<NewsPost[]> {
    const rows = await sql`
      SELECT * FROM news_posts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializeNews);
  },

  async findById(id: string): Promise<NewsPost | null> {
    const [row] = await sql`SELECT * FROM news_posts WHERE id = ${id}`;
    return row ? serializeNews(row) : null;
  },

  async delete(id: string, userId: string): Promise<void> {
    await sql`DELETE FROM news_posts WHERE id = ${id} AND user_id = ${userId}`;
  },
};
