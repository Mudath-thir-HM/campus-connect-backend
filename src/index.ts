import { Elysia } from "elysia";
import { sql } from "./db/client";
import { authRoutes } from "./routes/auth.routes";
import { swagger } from "@elysiajs/swagger";
import { AuthError } from "./services/auth.service";
import { forumRoutes } from "./routes/forum.routes";
import { postRoutes } from "./routes/post.routes";
import { commentActionRoutes, commentRoutes } from "./routes/comment.routes";
import { mediaRoutes } from "./routes/media.routes";
import { messageRoutes } from "./routes/message.routes";

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
  .listen(3000);

console.log(`Server running on port ${app.server?.port}`);
