// src/routes/media.routes.ts
import { Elysia, t } from "elysia";
import { mediaController } from "../controllers/media.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const mediaSchema = t.Object({
  id: t.String({ examples: ["3f2a1b4c-4444-4a2b-8c3d-abc123456789"] }),
  owner_type: t.String({ examples: ["post"] }),
  owner_id: t.String({ examples: ["7a2b1c3d-2222-4a2b-8c3d-abc123456789"] }),
  url: t.String({
    examples: [
      "https://xyzco.supabase.co/storage/v1/object/public/media/posts/7a2b.../a1b2c3.jpg",
    ],
  }),
  mime_type: t.String({ examples: ["image/jpeg"] }),
  media_type: t.String({ examples: ["image"] }),
  created_at: t.String({ examples: ["2026-07-28T10:00:00.000Z"] }),
});

export const mediaRoutes = new Elysia({ prefix: "/posts" })
  .use(authMiddleware)
  .post(
    "/:id/media",
    async ({ body, params, set }) => {
      try {
        const result = await mediaController.uploadPostMedia(
          params.id,
          body.file,
        );
        return { success: true, data: result };
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        file: t.File({
          type: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
          maxSize: 5 * 1024 * 1024,
        }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: mediaSchema,
        }),
        400: t.Object({
          success: t.Literal(false),
          error: t.String({
            examples: [
              "Video uploads are currently disabled.",
              "Unsupported file type. Only images and videos are allowed.",
            ],
          }),
        }),
      },
      detail: {
        tags: ["Media"],
        summary: "Upload media to a post",
        description:
          "Uploads an image (or video if enabled) to a specific post. Requires Authorization header: `Authorization: Bearer <token>`",
      },
    },
  );
