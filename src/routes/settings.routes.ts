import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { settingsController } from "../controllers/settings.controller";
import {
  updateProfileSchema,
  changePasswordSchema,
  updateNotificationPrefsSchema,
} from "../types/schema";

export const settingsRoutes = new Elysia({ prefix: "/users/me" })
  .use(authMiddleware)
  .patch("/", settingsController.updateProfile, {
    body: updateProfileSchema,
    response: {
      200: t.Object({
        id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
        full_name: t.String({ examples: ["Muhammad Hauwa"] }),
        email: t.String({ examples: ["email@example.com"] }),
        phone: t.String({ examples: ["+2347012345678"] }),
      }),
      400: t.Object({ error: t.String(), code: t.String() }),
    },
    detail: {
      summary: "Update user profile",
      description:
        "Update user profile information. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .post("/password", settingsController.changePassword, {
    body: changePasswordSchema,
    response: {
      200: t.Object({ message: t.String({ examples: ["Password updated"] }) }),
      400: t.Object({
        error: t.String({ examples: ["Current password is incorrect"] }),
        code: t.String({ examples: ["INVALID_CURRENT_PASSWORD"] }),
      }),
    },
    detail: {
      summary: "Change password",
      description:
        "Change user password. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  })
  .patch("/notifications", settingsController.updateNotifications, {
    body: updateNotificationPrefsSchema,
    response: {
      200: t.Object({
        email_notifications: t.Boolean({ examples: [true] }),
        push_notifications: t.Boolean({ examples: [true] }),
        forum_reply_notifications: t.Boolean({ examples: [false] }),
      }),
    },
    detail: {
      summary: "Update notification preferences",
      description:
        "Update notification preferences. Requires Authorization header: `Authorization: Bearer <token>`",
    },
  });
