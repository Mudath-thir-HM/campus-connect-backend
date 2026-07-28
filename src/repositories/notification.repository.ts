import { sql } from "../db/client";
import { toIso } from "../utils/serialize";

function serializeNotification(row: any) {
  return {
    ...row,
    created_at: toIso(row.created_at),
    read_at: row.read_at ? toIso(row.read_at) : null,
  };
}

export const notificationRepository = {
  async create(
    userId: string,
    type: string,
    title: string,
    body: string | null,
    relatedId: string | null,
  ) {
    const [row] = await sql`
      INSERT INTO notifications (user_id, type, title, body, related_id)
      VALUES (${userId}, ${type}, ${title}, ${body}, ${relatedId})
      RETURNING *
    `;
    return serializeNotification(row);
  },

  async listForUser(userId: string, limit = 30, offset = 0) {
    const rows = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializeNotification);
  },

  async markRead(id: string, userId: string) {
    await sql`UPDATE notifications SET read_at = now() WHERE id = ${id} AND user_id = ${userId} AND read_at IS NULL`;
  },

  async markAllRead(userId: string) {
    await sql`UPDATE notifications SET read_at = now() WHERE user_id = ${userId} AND read_at IS NULL`;
  },

  async unreadCount(userId: string): Promise<number> {
    const [row] =
      await sql`SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = ${userId} AND read_at IS NULL`;
    return Number(row.count);
  },
};
