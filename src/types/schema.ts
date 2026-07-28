import { t } from "elysia";

export const registerSchema = t.Object({
  full_name: t.String({ minLength: 2 }),
  matric_number: t.String({ minLength: 3 }),
  email: t.String({ format: "email" }),
  phone: t.String({ minLength: 10 }),
  password: t.String({ minLength: 8 }),
});

export const verifyOtpSchema = t.Object({
  user_id: t.String(),
  code: t.String({ minLength: 6, maxLength: 6 }),
});

export const loginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const createForumSchema = t.Object({
  name: t.String({ minLength: 2 }),
  description: t.Optional(t.String()),
});

export const createPostSchema = t.Object({
  body: t.String({ minLength: 1 }),
  forum_id: t.Optional(t.String()),
});

export const voteSchema = t.Object({
  value: t.Union([t.Literal(1), t.Literal(-1), t.Literal(0)]),
});

export const createCommentSchema = t.Object({
  body: t.String({ minLength: 1 }),
  parent_comment_id: t.Optional(t.String()),
});

export const sendMessageSchema = t.Object({
  recipient_id: t.String(),
  body: t.String({ minLength: 1 }),
});

export const createNewsSchema = t.Object({
  title: t.String({ minLength: 2 }),
  body: t.String({ minLength: 1 }),
});

export const createEventSchema = t.Object({
  title: t.String({ minLength: 2 }),
  description: t.Optional(t.String()),
  venue: t.Optional(t.String()),
  event_date: t.String(), // ISO date string from the client
});

export const updateProfileSchema = t.Object({
  full_name: t.Optional(t.String({ minLength: 2 })),
  email: t.Optional(t.String({ format: "email" })),
  phone: t.Optional(t.String({ minLength: 10 })),
});

export const changePasswordSchema = t.Object({
  current_password: t.String(),
  new_password: t.String({ minLength: 8 }),
});

export const updateNotificationPrefsSchema = t.Object({
  email_notifications: t.Optional(t.Boolean()),
  push_notifications: t.Optional(t.Boolean()),
  forum_reply_notifications: t.Optional(t.Boolean()),
});

export const forumSchema = t.Object({
  id: t.String({ examples: ["9b1f2c3a-1111-4a2b-8c3d-abc123456789"] }),
  name: t.String({ examples: ["CSC 300 Level"] }),
  description: t.Union([t.String(), t.Null()], {
    examples: ["Discussion for 300L Computer Science students"],
  }),
  created_by: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  created_at: t.String({ examples: ["2026-07-26T15:48:09.000Z"] }),
});

export const basePostSchema = t.Object({
  id: t.String({ examples: ["7a2b1c3d-2222-4a2b-8c3d-abc123456789"] }),
  user_id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  forum_id: t.Union([t.String(), t.Null()], {
    examples: ["9b1f2c3a-1111-4a2b-8c3d-abc123456789"],
  }),
  body: t.String({ examples: ["Does anyone have CSC 308 lecture notes?"] }),
  created_at: t.String({ examples: ["2026-07-26T15:48:09.000Z"] }),
  updated_at: t.String({ examples: ["2026-07-26T15:48:09.000Z"] }),
});

export const feedPostSchema = t.Composite([
  basePostSchema,
  t.Object({
    author_name: t.String({ examples: ["Mudathir Hassan"] }),
    vote_score: t.Number({ examples: [3] }),
    comment_count: t.Number({ examples: [2] }),
  }),
]);
