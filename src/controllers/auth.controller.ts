import { authService } from "../services/auth.service";

export const authController = {
  register: async ({ body }: any) => authService.register(body),

  resendOtp: async ({ body }: any) => authService.resendOtp(body.user_id),

  verifyOtp: async ({ body }: any) =>
    authService.verifyOtp(body.user_id, body.code),

  login: async ({ body, jwt }: any) => {
    const user = await authService.login(body.email, body.password);
    const token = await jwt.sign({ sub: user.id });
    return { id: user.id, full_name: user.full_name, email: user.email, token };
  },

  logout: async () => {
    return { message: "Logged out successfully" };
  },
};
