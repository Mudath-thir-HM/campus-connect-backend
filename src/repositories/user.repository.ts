import { sql } from "../db/client";
import type { User } from "../db/models/user.model";

export const userRepository = {
  async create(data: {
    full_name: string;
    matric_number: string;
    email: string;
    phone: string;
    password_hash: string;
  }): Promise<User> {
    const [user] = await sql`
      INSERT INTO users (full_name, matric_number, email, phone, password_hash)
      VALUES (${data.full_name}, ${data.matric_number}, ${data.email}, ${data.phone}, ${data.password_hash})
      RETURNING *
    `;
    return user as User;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    return (user as User) ?? null;
  },

  async findByEmailOrPhoneOrMatric(
    email: string,
    phone: string,
    matric: string,
  ): Promise<User | null> {
    const [user] = await sql`
      SELECT * FROM users
      WHERE email = ${email} OR phone = ${phone} OR matric_number = ${matric}
    `;
    return (user as User) ?? null;
  },

  async findById(id: string): Promise<User | null> {
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
    return (user as User) ?? null;
  },

  async markPhoneVerified(id: string): Promise<void> {
    await sql`UPDATE users SET phone_verified = true, updated_at = now() WHERE id = ${id}`;
  },

  async updateProfile(
    id: string,
    data: { full_name?: string; email?: string; phone?: string },
  ): Promise<User> {
    const [user] = await sql`
    UPDATE users SET
      full_name = COALESCE(${data.full_name ?? null}, full_name),
      email = COALESCE(${data.email ?? null}, email),
      phone = COALESCE(${data.phone ?? null}, phone),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
    return user as User;
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${id}`;
  },

  async updateNotificationPrefs(
    id: string,
    prefs: {
      email_notifications?: boolean;
      push_notifications?: boolean;
      forum_reply_notifications?: boolean;
    },
  ): Promise<User> {
    const [user] = await sql`
    UPDATE users SET
      email_notifications = COALESCE(${prefs.email_notifications ?? null}, email_notifications),
      priority_sms_enabled = COALESCE(${prefs.push_notifications ?? null}, priority_sms_enabled),
      forum_reply_notifications = COALESCE(${prefs.forum_reply_notifications ?? null}, forum_reply_notifications),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
    return user as User;
  },
};
