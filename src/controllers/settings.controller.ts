import { settingsService } from "../services/settings.service";

export const settingsController = {
  updateProfile: async ({ body, currentUser }: any) =>
    settingsService.updateProfile(currentUser.id, body),
  changePassword: async ({ body, currentUser }: any) =>
    settingsService.changePassword(
      currentUser.id,
      body.current_password,
      body.new_password,
    ),
  updateNotifications: async ({ body, currentUser }: any) =>
    settingsService.updateNotificationPrefs(currentUser.id, body),
};
