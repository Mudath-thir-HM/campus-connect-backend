import { notificationRepository } from "../repositories/notification.repository";

export const notificationService = {
  // fire-and-forget helper other services call — never awaited by the caller's response path
  async notify(
    userId: string,
    type: string,
    title: string,
    body: string | null,
    relatedId: string | null,
  ) {
    try {
      await notificationRepository.create(userId, type, title, body, relatedId);
    } catch (err) {
      console.error(
        `[notifications] failed to create for user ${userId}:`,
        err,
      );
    }
  },

  async list(userId: string, limit: number, offset: number) {
    return notificationRepository.listForUser(userId, limit, offset);
  },

  async markRead(userId: string, id: string) {
    await notificationRepository.markRead(id, userId);
    return { message: "Marked as read" };
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
    return { message: "All notifications marked as read" };
  },

  async unreadCount(userId: string) {
    return { count: await notificationRepository.unreadCount(userId) };
  },
};
