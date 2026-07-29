import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { authController } from "../controllers/auth.controller";
import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  resendOtpSchema,
} from "../types/schema";

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
          examples: [
            "Full name must be at least 8 characters",
            "Please enter a valid email address",
            "Please enter a valid Nigerian phone number",
            "Password must be at least 8 characters and include uppercase, lowercase, and a number",
            "Email, phone, or matric number already registered",
          ],
        }),
        code: t.String({
          examples: [
            "INVALID_FULL_NAME",
            "INVALID_EMAIL",
            "INVALID_PHONE",
            "INVALID_PASSWORD",
            "ALREADY_REGISTERED",
          ],
        }),
      }),
    },
  })
  .post("/resend-otp", authController.resendOtp, {
    body: resendOtpSchema,
    response: {
      200: t.Object({
        message: t.String({ examples: ["OTP resent successfully"] }),
      }),
      400: t.Object({
        error: t.String({ examples: ["User not found"] }),
        code: t.String({ examples: ["USER_NOT_FOUND"] }),
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
    response: {
      200: t.Object({
        id: t.String({ examples: ["4fd7d285-6999-40e1-a04b-c687cac577c2"] }),
        full_name: t.String({ examples: ["Mudathir Hassan"] }),
        email: t.String({ examples: ["eighthmudathir@gmail.com"] }),
        token: t.String({ examples: ["eyJhbGciOiJIUzI1NiIs..."] }),
      }),
      400: t.Object({
        error: t.String({
          examples: [
            "Please enter a valid email address",
            "Password must be at least 8 characters",
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
    detail: {
      summary: "User login",
      description:
        "Authenticate user and receive JWT token. Send token in Authorization header for protected routes: `Authorization: Bearer <token>`",
    },
  })
  .post("/logout", authController.logout, {
    response: {
      200: t.Object({
        message: t.String({ examples: ["Logged out successfully"] }),
      }),
    },
  });
