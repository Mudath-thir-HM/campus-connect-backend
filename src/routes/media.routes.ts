// src/routes/media.routes.ts
import { Elysia, t } from "elysia";
import { mediaController } from "../controllers/media.controller";

export const mediaRoutes = new Elysia({ prefix: "/posts" }).post(
  "/:postId/media",
  async ({ body, params, set }) => {
    try {
      const result = await mediaController.uploadPostMedia(
        params.postId,
        body.file,
      );
      return { success: true, data: result };
    } catch (error: any) {
      set.status = 400;
      return { success: false, error: error.message };
    }
  },
  {
    // Elysia validation: strictly enforce file type and size at the edge
    body: t.Object({
      file: t.File({
        type: ["image/jpeg", "image/png", "image/webp", "video/mp4"], // Video allowed in schema, but blocked in service
        maxSize: 5 * 1024 * 1024, // 5MB limit for images
      }),
    }),
    detail: {
      tags: ["Media"],
      summary: "Upload media to a post",
      description: "Uploads an image (or video if enabled) to a specific post.",
    },
  },
);
