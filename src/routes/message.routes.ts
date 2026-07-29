import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { messageController } from "../controllers/message.controller";
import { sendMessageSchema } from "../types/schema";

const messageSchema = t.Object({
  id: t.String({ examples: ["9d1e2f3a-5555-4a2b-8c3d-abc123456789"] }),
  sender_id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  recipient_id: t.String({
    examples: ["7a2b1c3d-2222-4a2b-8c3d-abc123456789"],
  }),
  body: t.String({ examples: ["Do you have the lecture note for CSC 308?"] }),
  read_at: t.Union([t.String(), t.Null()]),
  sms_sent_at: t.Union([t.String(), t.Null()]),
  created_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
});

const conversationSchema = t.Object({
  other_user_id: t.String({
    examples: ["7a2b1c3d-2222-4a2b-8c3d-abc123456789"],
  }),
  other_user_name: t.String({ examples: ["Muhammad Kabir"] }),
  last_message: t.String({ examples: ["Yes, I do."] }),
  last_message_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
  last_message_is_mine: t.Boolean({ examples: [false] }),
});

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post("/", messageController.send, {
    body: sendMessageSchema,
    response: {
      200: messageSchema,
      400: t.Object({ error: t.String(), code: t.String() }),
    },
    detail: {
      summary: "Send a message",
      description:
        "Send a message to another user. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .get("/conversations", messageController.conversations, {
    response: { 200: t.Array(conversationSchema) },
    detail: {
      summary: "Get conversations",
      description:
        "Retrieve user conversations. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .get("/unread-count", messageController.unreadCount, {
    response: { 200: t.Object({ count: t.Number({ examples: [3] }) }) },
    detail: {
      summary: "Get unread message count",
      description:
        "Retrieve unread message count. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .get("/:id", messageController.thread, {
    params: t.Object({ id: t.String() }),
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    response: { 200: t.Array(messageSchema) },
    detail: {
      summary: "Get message thread",
      description:
        "Retrieve message thread. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  });
