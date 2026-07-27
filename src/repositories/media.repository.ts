// src/repositories/media.repository.ts
import { sql } from "bun";

export const mediaRepository = {
  async create(data: {
    ownerType: "post" | "news" | "event";
    ownerId: string;
    url: string;
    mimeType: string;
    mediaType: "image" | "video";
  }) {
    const [row] = await sql`
      INSERT INTO media (owner_type, owner_id, url, mime_type, media_type)
      VALUES (${data.ownerType}, ${data.ownerId}, ${data.url}, ${data.mimeType}, ${data.mediaType})
      RETURNING id, owner_type, owner_id, url, mime_type, media_type, created_at
    `;
    return row;
  },

  async getByOwner(ownerType: string, ownerId: string) {
    return await sql`
      SELECT id, url, mime_type, media_type, created_at 
      FROM media 
      WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
      ORDER BY created_at ASC
    `;
  },
};
