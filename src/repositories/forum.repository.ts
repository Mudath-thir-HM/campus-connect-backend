import { sql } from "../db/client";
import type { Forum } from "../db/models/forum.model";

export const forumRepository = {
  async create(
    name: string,
    description: string | null,
    createdBy: string,
  ): Promise<Forum> {
    const [forum] = await sql`
      INSERT INTO forums (name, description, created_by)
      VALUES (${name}, ${description}, ${createdBy})
      RETURNING *
    `;
    return serializeForum(forum);
  },

  async list(): Promise<Forum[]> {
    const rows = await sql`SELECT * FROM forums ORDER BY created_at DESC`;
    return rows.map(serializeForum);
  },

  async findById(id: string): Promise<Forum | null> {
    const [forum] = await sql`SELECT * FROM forums WHERE id = ${id}`;
    return forum ? serializeForum(forum) : null;
  },

  async join(forumId: string, userId: string): Promise<void> {
    await sql`
      INSERT INTO forum_members (forum_id, user_id)
      VALUES (${forumId}, ${userId})
      ON CONFLICT DO NOTHING
    `;
  },

  async leave(forumId: string, userId: string): Promise<void> {
    await sql`DELETE FROM forum_members WHERE forum_id = ${forumId} AND user_id = ${userId}`;
  },

  async isMember(forumId: string, userId: string): Promise<boolean> {
    const [row] = await sql`
      SELECT 1 FROM forum_members WHERE forum_id = ${forumId} AND user_id = ${userId}
    `;
    return !!row;
  },
};

function serializeForum(row: any): Forum {
  return { ...row, created_at: new Date(row.created_at).toISOString() };
}
