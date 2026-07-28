import { notificationService } from "../services/notification.service";

export const notificationController = {
  list: async ({ query, currentUser }: any) =>
    notificationService.list(
      currentUser.id,
      Number(query.limit ?? 30),
      Number(query.offset ?? 0),
    ),
  markRead: async ({ params, currentUser }: any) =>
    notificationService.markRead(currentUser.id, params.id),
  markAllRead: async ({ currentUser }: any) =>
    notificationService.markAllRead(currentUser.id),
  unreadCount: async ({ currentUser }: any) =>
    notificationService.unreadCount(currentUser.id),
};
