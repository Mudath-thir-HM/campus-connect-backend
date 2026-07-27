import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { commentController } from "../controllers/comment.controller";
import { createCommentSchema, voteSchema } from "../types/schema";

const baseCommentSchema = t.Object({
  id: t.String({ examples: ["c1a2b3c4-3333-4a2b-8c3d-abc123456789"] }),
  post_id: t.String({ examples: ["7a2b1c3d-2222-4a2b-8c3d-abc123456789"] }),
  user_id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
  parent_comment_id: t.Union([t.String(), t.Null()]),
  body: t.String({ examples: ["Yes, I have it — I'll DM you."] }),
  created_at: t.String({ examples: ["2026-07-26T15:48:09.000Z"] }),
});

// recursive type: a comment node containing an array of itself
const commentNodeSchema: any = t.Recursive(
  (Self) =>
    t.Composite([
      baseCommentSchema,
      t.Object({
        author_name: t.String({ examples: ["Mudathir Hassan"] }),
        vote_score: t.Number({ examples: [2] }),
        replies: t.Array(Self),
      }),
    ]),
  { $id: "CommentNode" },
);

export const commentRoutes = new Elysia({ prefix: "/posts/:id/comments" })
  .get("/", commentController.tree, {
    params: t.Object({ id: t.String() }),
    response: { 200: t.Array(commentNodeSchema) },
  })
  .use(authMiddleware)
  .post("/", commentController.create, {
    params: t.Object({ id: t.String() }),
    body: createCommentSchema,
    response: {
      200: baseCommentSchema,
      400: t.Object({ error: t.String(), code: t.String() }),
    },
  });

export const commentActionRoutes = new Elysia({ prefix: "/comments" })
  .use(authMiddleware)
  .post("/:id/vote", commentController.vote, {
    params: t.Object({ id: t.String() }),
    body: voteSchema,
    response: {
      200: t.Object({ message: t.String({ examples: ["Vote recorded"] }) }),
      400: t.Object({ error: t.String(), code: t.String() }),
    },
  })
  .delete("/:id", commentController.delete, {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String({ examples: ["Comment deleted"] }) }),
    },
  });
