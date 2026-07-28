import { sql } from "../db/client";
import { toIso } from "../utils/serialize";
import type { Event } from "../db/models/content.model";

function serializeEvent(row: any): Event {
  return {
    ...row,
    created_at: toIso(row.created_at),
    event_date: toIso(row.event_date),
  };
}

export const eventRepository = {
  async create(
    createdBy: string,
    title: string,
    description: string | null,
    venue: string | null,
    eventDate: Date,
  ): Promise<Event> {
    const [row] = await sql`
      INSERT INTO events (created_by, title, description, venue, event_date)
      VALUES (${createdBy}, ${title}, ${description}, ${venue}, ${eventDate})
      RETURNING *
    `;
    return serializeEvent(row);
  },

  async list(limit = 20, offset = 0): Promise<Event[]> {
    const rows = await sql`
      SELECT * FROM events ORDER BY event_date ASC LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(serializeEvent);
  },

  async findById(id: string): Promise<Event | null> {
    const [row] = await sql`SELECT * FROM events WHERE id = ${id}`;
    return row ? serializeEvent(row) : null;
  },

  async register(eventId: string, userId: string): Promise<void> {
    await sql`
      INSERT INTO event_registrations (event_id, user_id)
      VALUES (${eventId}, ${userId})
      ON CONFLICT DO NOTHING
    `;
  },

  async isRegistered(eventId: string, userId: string): Promise<boolean> {
    const [row] = await sql`
      SELECT 1 FROM event_registrations WHERE event_id = ${eventId} AND user_id = ${userId}
    `;
    return !!row;
  },

  async registrationCount(eventId: string): Promise<number> {
    const [row] = await sql`
      SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = ${eventId}
    `;
    return Number(row.count);
  },
};
