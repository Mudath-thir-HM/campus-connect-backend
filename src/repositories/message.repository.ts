import { sql } from "../db/client";
import { toIso } from "../utils/serialize";
import type { DirectMessage } from "../db/models/message.model";

function serializeMessage(row: any): DirectMessage {
  return {
    ...row,
    created_at: toIso(row.created_at),
    read_at: row.read_at ? toIso(row.read_at) : null,
    sms_sent_at: row.sms_sent_at ? toIso(row.sms_sent_at) : null,
  };
}

export const messageRepository = {
  async create(
    senderId: string,
    recipientId: string,
    body: string,
  ): Promise<DirectMessage> {
    const [msg] = await sql`
      INSERT INTO direct_messages (sender_id, recipient_id, body)
      VALUES (${senderId}, ${recipientId}, ${body})
      RETURNING *
    `;
    return serializeMessage(msg);
  },

  // full thread between two users, oldest first
  async threadBetween(
    userA: string,
    userB: string,
    limit = 50,
    offset = 0,
  ): Promise<DirectMessage[]> {
    const rows = await sql`
      SELECT * FROM direct_messages
      WHERE (sender_id = ${userA} AND recipient_id = ${userB})
         OR (sender_id = ${userB} AND recipient_id = ${userA})
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializeMessage);
  },

  // one row per conversation partner, with their latest message — for a "Chats" sidebar
  async conversationsFor(userId: string): Promise<any[]> {
    const rows = await sql`
    SELECT DISTINCT ON (other_user_id)
      other_user_id,
      u.full_name AS other_user_name,
      dm.body AS last_message,
      dm.created_at AS last_message_at,
      dm.sender_id = ${userId} AS last_message_is_mine
    FROM (
      SELECT
        CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS other_user_id,
        body, created_at, sender_id, recipient_id
      FROM direct_messages
      WHERE sender_id = ${userId} OR recipient_id = ${userId}
    ) dm
    JOIN users u ON u.id = dm.other_user_id
    ORDER BY other_user_id, dm.created_at DESC
  `;
    return rows.map((r: any) => ({
      ...r,
      last_message_at: toIso(r.last_message_at),
    }));
  },

  async markThreadRead(recipientId: string, senderId: string): Promise<void> {
    await sql`
      UPDATE direct_messages
      SET read_at = now()
      WHERE recipient_id = ${recipientId} AND sender_id = ${senderId} AND read_at IS NULL
    `;
  },

  async unreadCountFor(userId: string): Promise<number> {
    const [row] = await sql`
      SELECT COUNT(*)::int AS count FROM direct_messages
      WHERE recipient_id = ${userId} AND read_at IS NULL
    `;
    return Number(row.count);
  },

  async findUnreadPastThreshold(minutes: number): Promise<any[]> {
    const rows = await sql`
    SELECT dm.id, dm.body, dm.created_at,
      u.id AS recipient_id, u.phone AS recipient_phone, u.priority_sms_enabled,
      s.full_name AS sender_name
    FROM direct_messages dm
    JOIN users u ON u.id = dm.recipient_id
    JOIN users s ON s.id = dm.sender_id
    WHERE dm.read_at IS NULL
      AND dm.sms_sent_at IS NULL
      AND dm.created_at < now() - (${minutes} || ' minutes')::interval
      AND u.priority_sms_enabled = true
  `;
    return rows.map((r: any) => ({ ...r, created_at: toIso(r.created_at) }));
  },

  async markSmsSent(id: string): Promise<void> {
    await sql`UPDATE direct_messages SET sms_sent_at = now() WHERE id = ${id}`;
  },
};
