// src/config/s3.ts
import { S3Client } from "bun";

export const s3Client = new S3Client({
  bucket: process.env.SUPABASE_S3_BUCKET!,
  accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
  secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  region: "us-east-1", // Supabase S3 API uses this region
});

// Helper to generate the public URL for the frontend
export const getPublicUrl = (key: string) => {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_S3_BUCKET}/${key}`;
};
