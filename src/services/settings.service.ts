import { userRepository } from "../repositories/user.repository";
import { normalizeNigerianPhone } from "../utils/phone";
import { AuthError } from "./auth.service";

export const settingsService = {
  async updateProfile(
    userId: string,
    data: { full_name?: string; email?: string; phone?: string },
  ) {
    const normalizedPhone = data.phone
      ? normalizeNigerianPhone(data.phone)
      : undefined;

    if (data.email || normalizedPhone) {
      const existing = await userRepository.findByEmailOrPhoneOrMatric(
        data.email ?? "",
        normalizedPhone ?? "",
        "",
      );
      if (existing && existing.id !== userId) {
        throw new AuthError(
          "EMAIL_OR_PHONE_TAKEN",
          "That email or phone is already in use by another account",
        );
      }
    }

    const user = await userRepository.updateProfile(userId, {
      ...data,
      phone: normalizedPhone,
    });
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AuthError("UNAUTHORIZED", "Please log in");

    const valid = await Bun.password.verify(
      currentPassword,
      user.password_hash,
    );
    if (!valid)
      throw new AuthError(
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect",
      );

    const newHash = await Bun.password.hash(newPassword);
    await userRepository.updatePasswordHash(userId, newHash);
    return { message: "Password updated" };
  },

  async updateNotificationPrefs(
    userId: string,
    prefs: {
      email_notifications?: boolean;
      push_notifications?: boolean;
      forum_reply_notifications?: boolean;
    },
  ) {
    const user = await userRepository.updateNotificationPrefs(userId, prefs);
    return {
      email_notifications: user.email_notifications,
      push_notifications: user.priority_sms_enabled,
      forum_reply_notifications: user.forum_reply_notifications,
    };
  },
};
