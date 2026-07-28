import { messageService } from "../services/message.service";

export const messageController = {
  send: async ({ body, currentUser }: any) =>
    messageService.send(currentUser.id, body.recipient_id, body.body),
  conversations: async ({ currentUser }: any) =>
    messageService.conversations(currentUser.id),
  thread: async ({ params, query, currentUser }: any) =>
    messageService.thread(
      currentUser.id,
      params.id,
      Number(query.limit ?? 50),
      Number(query.offset ?? 0),
    ),
  unreadCount: async ({ currentUser }: any) =>
    messageService.unreadCount(currentUser.id),
};
