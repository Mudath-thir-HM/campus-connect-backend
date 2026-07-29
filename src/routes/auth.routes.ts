import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { authController } from "../controllers/auth.controller";
import { registerSchema, verifyOtpSchema, loginSchema } from "../types/schema";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .post("/register", authController.register, {
    body: registerSchema,
    response: {
      200: t.Object({
        id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
        message: t.String({
          examples: ["Registered. OTP sent to email and phone."],
        }),
      }),
      400: t.Object({
        error: t.String({
          examples: ["Email, phone, or matric number already registered"],
        }),
      }),
    },
  })
  .post("/verify-otp", authController.verifyOtp, {
    body: verifyOtpSchema,
    response: {
      200: t.Object({
        message: t.String({ examples: ["Phone verified successfully"] }),
      }),
      400: t.Object({
        error: t.String({ examples: ["Invalid or expired OTP"] }),
      }),
    },
  })
  .post("/login", authController.login, {
    body: loginSchema,
    cookie: t.Cookie({ auth: t.Optional(t.String()) }),
    response: {
      200: t.Object({
        id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
        full_name: t.String({ examples: ["Mudathir Hassan"] }),
        email: t.String({ examples: ["eighthmudathir@gmail.com"] }),
      }),
      400: t.Object({
        error: t.String({
          examples: [
            "Email not found",
            "Incorrect password",
            "Please verify your account first",
          ],
        }),
        code: t.String({
          examples: [
            "INVALID_EMAIL",
            "INVALID_PASSWORD",
            "ACCOUNT_NOT_VERIFIED",
          ],
        }),
      }),
    },
  })
  .post("/logout", authController.logout, {
    cookie: t.Cookie({ auth: t.Optional(t.String()) }),
    response: {
      200: t.Object({
        message: t.String({ examples: ["Logged out successfully"] }),
      }),
    },
  });
