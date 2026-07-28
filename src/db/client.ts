import { SQL } from "bun";

export const sql = new SQL(process.env.DATABASE_URL!, {
  prepare: false, // safe default when connecting through a pooler like Neon's PgBouncer
});
