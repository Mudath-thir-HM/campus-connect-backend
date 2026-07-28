import { newsRepository } from "../repositories/news.repository";
import { AuthError } from "./auth.service";

export const newsService = {
  async create(userId: string, title: string, body: string) {
    return newsRepository.create(userId, title, body);
  },
  async list(limit: number, offset: number) {
    return newsRepository.list(limit, offset);
  },
  async delete(userId: string, id: string) {
    const post = await newsRepository.findById(id);
    if (!post) throw new AuthError("NEWS_NOT_FOUND", "News post not found");
    await newsRepository.delete(id, userId);
    return { message: "News post deleted" };
  },
};
