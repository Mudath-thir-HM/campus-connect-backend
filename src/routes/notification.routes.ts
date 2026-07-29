import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { notificationController } from "../controllers/notification.controller";

const notificationSchema = t.Object({
  id: t.String({ examples: ["e1f2a3b4-8888-4a2b-8c3d-abc123456789"] }),
  user_id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  type: t.String({ examples: ["forum_reply"] }),
  title: t.String({ examples: ["New Forum Reply"] }),
  body: t.Union([t.String(), t.Null()], {
    examples: ["Muhammad Kabir replied to your Forum post."],
  }),
  related_id: t.Union([t.String(), t.Null()]),
  read_at: t.Union([t.String(), t.Null()]),
  created_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
});

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(authMiddleware)
  .get("/", notificationController.list, {
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    response: { 200: t.Array(notificationSchema) },
    detail: {
      summary: "List notifications",
      description:
        "Retrieve user notifications. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .get("/unread-count", notificationController.unreadCount, {
    response: { 200: t.Object({ count: t.Number({ examples: [4] }) }) },
    detail: {
      summary: "Get unread notification count",
      description:
        "Retrieve unread notification count. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/:id/read", notificationController.markRead, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["Marked as read"] }) }),
    },
    detail: {
      summary: "Mark notification as read",
      description:
        "Mark a notification as read. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/read-all", notificationController.markAllRead, {
    response: {
      200: t.Object({
        message: t.String({ examples: ["All notifications marked as read"] }),
      }),
    },
    detail: {
      summary: "Mark all notifications as read",
      description:
        "Mark all notifications as read. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  });
