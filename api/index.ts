import { Elysia } from "elysia";
import { sql } from "../src/db/client";
import { authRoutes } from "../src/routes/auth.routes";
import { swagger } from "@elysiajs/swagger";
import { AuthError } from "../src/services/auth.service";
import { forumRoutes } from "../src/routes/forum.routes";
import { postRoutes } from "../src/routes/post.routes";
import { commentActionRoutes, commentRoutes } from "../src/routes/comment.routes";
import { mediaRoutes } from "../src/routes/media.routes";
import { messageRoutes } from "../src/routes/message.routes";
import { eventRoutes } from "../src/routes/event.routes";
import { newsRoutes } from "../src/routes/news.routes";
import { settingsRoutes } from "../src/routes/settings.routes";
import { notificationRoutes } from "../src/routes/notification.routes";

const app = new Elysia()
  .onError(({ error, set }) => {
    set.status = 400;
    if (error instanceof AuthError) {
      return { error: error.message, code: error.code };
    }
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { error: message };
  })
  .use(swagger())
  .get("/health", async () => {
    const result = await sql`SELECT NOW()`;
    return { status: "ok", dbTime: result[0].now };
  })
  .use(authRoutes)
  .use(forumRoutes)
  .use(postRoutes)
  .use(commentRoutes)
  .use(commentActionRoutes)
  .use(mediaRoutes)
  .use(messageRoutes)
  .use(eventRoutes)
  .use(newsRoutes)
  .use(settingsRoutes)
  .use(notificationRoutes);

export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(req: any, res: any) {
  const originalUrl = req.url ?? "/";
  const normalizedPath = originalUrl.replace(/^\/api/, "") || "/";
  const requestUrl = new URL(
    normalizedPath,
    `https://${req.headers.host ?? "localhost"}`,
  );

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const request = new Request(requestUrl.toString(), {
    method: req.method ?? "GET",
    headers: req.headers as Record<string, string>,
    body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
  });

  const response = await app.fetch(request);
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}
