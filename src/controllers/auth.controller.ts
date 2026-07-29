import { authService } from "../services/auth.service";

export const authController = {
  register: async ({ body }: any) => authService.register(body),

  verifyOtp: async ({ body }: any) =>
    authService.verifyOtp(body.user_id, body.code),

  login: async ({ body, jwt, cookie }: any) => {
    const user = await authService.login(body.email, body.password);
    const token = await jwt.sign({ sub: user.id });
    cookie.auth.set({
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 86400,
    });
    return { id: user.id, full_name: user.full_name, email: user.email }; // token removed
  },

  logout: async ({ cookie }: any) => {
    cookie.auth.set({
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return { message: "Logged out successfully" };
  },
};
