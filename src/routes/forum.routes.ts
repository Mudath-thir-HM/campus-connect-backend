import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { forumController } from "../controllers/forum.controller";
import { createForumSchema, forumSchema } from "../types/schema";

export const forumRoutes = new Elysia({ prefix: "/forums" })
  .get("/", forumController.list as any, {
    response: { 200: t.Array(forumSchema) },
  })
  .use(authMiddleware)
  .onBeforeHandle(({ currentUser }: any) => {
    console.log("[forum.routes] currentUser after middleware:", currentUser);
  })
  .post("/", forumController.create as any, {
    body: createForumSchema,
    response: {
      200: forumSchema,
      400: t.Object({ error: t.String(), code: t.String() }),
    },
  })
  .post("/:id/join", forumController.join as any, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["Joined forum"] }) }),
      400: t.Object({
        error: t.String({ examples: ["Forum not found"] }),
        code: t.String({ examples: ["FORUM_NOT_FOUND"] }),
      }),
    },
  })
  .post("/:id/leave", forumController.leave, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["Left forum"] }) }),
    },
  });
