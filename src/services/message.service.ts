import { messageRepository } from "../repositories/message.repository";
import { userRepository } from "../repositories/user.repository";
import { AuthError } from "./auth.service";

export const messageService = {
  async send(senderId: string, recipientId: string, body: string) {
    if (senderId === recipientId)
      throw new AuthError("CANNOT_MESSAGE_SELF", "You can't message yourself");

    const recipient = await userRepository.findById(recipientId);
    if (!recipient)
      throw new AuthError("RECIPIENT_NOT_FOUND", "Recipient not found");

    return messageRepository.create(senderId, recipientId, body);
  },

  async thread(
    userId: string,
    otherUserId: string,
    limit: number,
    offset: number,
  ) {
    const messages = await messageRepository.threadBetween(
      userId,
      otherUserId,
      limit,
      offset,
    );
    await messageRepository.markThreadRead(userId, otherUserId); // mark their messages to me as read
    return messages;
  },

  async conversations(userId: string) {
    return messageRepository.conversationsFor(userId);
  },

  async unreadCount(userId: string) {
    return { count: await messageRepository.unreadCountFor(userId) };
  },
};
