// src/services/media.service.ts
import { s3Client, getPublicUrl } from "../config/s3";
import { mediaRepository } from "../repositories/media.repository";
import { randomUUID } from "crypto";

// Feature flag to disable video uploads for now
const ENABLE_VIDEO_UPLOADS = false;

export const mediaService = {
  async uploadPostImage(postId: string, file: File) {
    // 1. Generate unique S3 key
    const ext = file.name.split(".").pop();
    const key = `posts/${postId}/${randomUUID()}.${ext}`;

    // 2. Upload to Supabase S3
    const s3File = s3Client.file(key);
    // Convert ReadableStream to ArrayBuffer for Bun S3Client compatibility
    const arrayBuffer = await new Response(file.stream()).arrayBuffer();
    await s3File.write(arrayBuffer);

    // 3. Get public URL and save to DB
    const publicUrl = getPublicUrl(key);
    const mediaRecord = await mediaRepository.create({
      ownerType: "post",
      ownerId: postId,
      url: publicUrl,
      mimeType: file.type,
      mediaType: "image",
    });

    return mediaRecord;
  },

  async uploadPostVideo(postId: string, file: File) {
    if (!ENABLE_VIDEO_UPLOADS) {
      throw new Error("Video uploads are currently disabled.");
    }

    // Future logic: ffprobe duration check, then upload...
    // const key = `posts/${postId}/${randomUUID()}.mp4`;
    // ...
  },
};
