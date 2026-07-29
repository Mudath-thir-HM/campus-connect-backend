import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { newsController } from "../controllers/news.controller";
import { createNewsSchema } from "../types/schema";

const newsSchema = t.Object({
  id: t.String({ examples: ["a1b2c3d4-6666-4a2b-8c3d-abc123456789"] }),
  user_id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  title: t.String({ examples: ["Orientation Programme Begins"] }),
  body: t.String({
    examples: [
      "The University has announced the commencement of the 2026 orientation programme.",
    ],
  }),
  created_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
});

export const newsRoutes = new Elysia({ prefix: "/news" })
  .use(authMiddleware)
  .get("/", newsController.list, {
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    response: { 200: t.Array(newsSchema) },
    detail: {
      summary: "List news posts",
      description:
        "Retrieve news posts list. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/", newsController.create, {
    body: createNewsSchema,
    response: { 200: newsSchema },
    detail: {
      summary: "Create a news post",
      description:
        "Create a new news post. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .delete("/:id", newsController.delete, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["News post deleted"] }) }),
      400: t.Object({ error: t.String(), code: t.String() }),
    },
    detail: {
      summary: "Delete a news post",
      description:
        "Delete a news post. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  });
