// middleware/auth.middleware.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { userRepository } from "../repositories/user.repository";
import { AuthError } from "../services/auth.service";

export const authMiddleware = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive({ as: "global" }, async ({ jwt, headers }) => {
    const bearerToken = headers.authorization?.replace("Bearer ", "");
    const token = bearerToken || null;
    console.log("[auth.middleware] extracted token:", token);

    const payload = token ? await jwt.verify(token) : null;

    if (!payload) throw new AuthError("UNAUTHORIZED", "Please log in");

    const user = await userRepository.findById(payload.sub as string);

    if (!user) throw new AuthError("UNAUTHORIZED", "Please log in");

    return { currentUser: user };
  });
