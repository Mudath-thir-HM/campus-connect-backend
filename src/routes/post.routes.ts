import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { postController } from "../controllers/post.controller";
import {
  basePostSchema,
  createPostSchema,
  feedPostSchema,
  voteSchema,
} from "../types/schema";

export const postRoutes = new Elysia({ prefix: "/posts" })
  .get("/", postController.feed as any, {
    query: t.Object({
      forum_id: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    response: { 200: t.Array(feedPostSchema) },
  })
  .use(authMiddleware)
  .post("/", postController.create as any, {
    body: createPostSchema,
    response: {
      200: basePostSchema, // <- create returns the bare row, not the feed shape
      400: t.Object({
        error: t.String({ examples: ["Join the forum before posting in it"] }),
        code: t.String({ examples: ["NOT_A_MEMBER"] }),
      }),
    },
  })
  .post("/:id/vote", postController.vote, {
    params: t.Object({ id: t.String() }),
    body: voteSchema,
    response: {
      200: t.Object({ message: t.String({ examples: ["Vote recorded"] }) }),
      400: t.Object({
        error: t.String({ examples: ["Post not found"] }),
        code: t.String({ examples: ["POST_NOT_FOUND"] }),
      }),
    },
  })
  .delete("/:id", postController.delete, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["Post deleted"] }) }),
    },
  });
