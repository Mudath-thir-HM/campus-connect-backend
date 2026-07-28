import { newsService } from "../services/news.service";

export const newsController = {
  create: async ({ body, currentUser }: any) =>
    newsService.create(currentUser.id, body.title, body.body),
  list: async ({ query }: any) =>
    newsService.list(Number(query.limit ?? 20), Number(query.offset ?? 0)),
  delete: async ({ params, currentUser }: any) =>
    newsService.delete(currentUser.id, params.id),
};
