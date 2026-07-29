import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { eventController } from "../controllers/event.controller";
import { createEventSchema } from "../types/schema";

const baseEventSchema = t.Object({
  id: t.String({ examples: ["b2c3d4e5-7777-4a2b-8c3d-abc123456789"] }),
  created_by: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  title: t.String({ examples: ["Tech Innovation Summit"] }),
  description: t.Union([t.String(), t.Null()], {
    examples: ["Join technology experts and students for a day of innovation."],
  }),
  venue: t.Union([t.String(), t.Null()], { examples: ["ICT Auditorium"] }),
  event_date: t.String({ examples: ["2026-08-20T09:00:00.000Z"] }),
  created_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
});

const feedEventSchema = t.Composite([
  baseEventSchema,
  t.Object({ registration_count: t.Number({ examples: [12] }) }),
]);

export const eventRoutes = new Elysia({ prefix: "/events" })
  .use(authMiddleware)
  .get("/", eventController.list, {
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    response: { 200: t.Array(feedEventSchema) },
    detail: {
      summary: "List events",
      description:
        "Retrieve events list. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/", eventController.create, {
    body: createEventSchema,
    response: { 200: baseEventSchema },
    detail: {
      summary: "Create an event",
      description:
        "Create a new event. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/:id/register", eventController.register, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({
        message: t.String({ examples: ["Registered for event"] }),
      }),
      400: t.Object({
        error: t.String({
          examples: ["You're already registered for this event"],
        }),
        code: t.String({ examples: ["ALREADY_REGISTERED"] }),
      }),
    },
  });
