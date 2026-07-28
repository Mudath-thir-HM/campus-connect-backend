// media.repository.ts
import { sql } from "bun";
import { toIso } from "../utils/serialize";

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
    return { ...row, created_at: toIso(row.created_at) };
  },

  async getByOwner(ownerType: string, ownerId: string) {
    const rows = await sql`
      SELECT id, url, mime_type, media_type, created_at 
      FROM media 
      WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
      ORDER BY created_at ASC
    `;
    return rows.map((r: any) => ({ ...r, created_at: toIso(r.created_at) }));
  },
};
