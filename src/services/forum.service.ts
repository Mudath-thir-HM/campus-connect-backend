import { forumRepository } from "../repositories/forum.repository";
import { AuthError } from "./auth.service"; // reusing the same error-with-code pattern

export const forumService = {
  async create(userId: string, name: string, description: string | null) {
    return forumRepository.create(name, description, userId);
  },

  async list() {
    return forumRepository.list();
  },

  async join(forumId: string, userId: string) {
    const forum = await forumRepository.findById(forumId);
    if (!forum) throw new AuthError("FORUM_NOT_FOUND", "Forum not found");
    await forumRepository.join(forumId, userId);
    return { message: "Joined forum" };
  },

  async leave(forumId: string, userId: string) {
    await forumRepository.leave(forumId, userId);
    return { message: "Left forum" };
  },
};
