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
import { eventRoutes } from "./routes/event.routes";
import { newsRoutes } from "./routes/news.routes";
import { prioritySmsService } from "./services/priority-sms.service";
import { settingsRoutes } from "./routes/settings.routes";
import { notificationRoutes } from "./routes/notification.routes";

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
  .use(notificationRoutes)
  .listen(3000);

const FIVE_MINUTES = 5 * 60 * 1000;
setInterval(() => {
  prioritySmsService
    .runCheck()
    .catch((err) => console.error("[priority-sms] check failed:", err));
}, FIVE_MINUTES);

prioritySmsService
  .runCheck()
  .catch((err) => console.error("[priority-sms] initial check failed:", err));
console.log(`Server running on port ${app.server?.port}`);
