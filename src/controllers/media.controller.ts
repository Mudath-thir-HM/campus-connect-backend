// src/controllers/media.controller.ts
import { mediaService } from "../services/media.service";

export const mediaController = {
  async uploadPostMedia(postId: string, file: File) {
    if (file.type.startsWith("image/")) {
      return await mediaService.uploadPostImage(postId, file);
    }
    if (file.type.startsWith("video/")) {
      return await mediaService.uploadPostVideo(postId, file);
    }

    throw new Error(
      "Unsupported file type. Only images and videos are allowed.",
    );
  },
};
