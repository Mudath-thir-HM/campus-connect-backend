import { forumService } from "../services/forum.service";

export const forumController = {
  create: async ({ body, currentUser }: any) =>
    forumService.create(currentUser.id, body.name, body.description ?? null),
  list: async () => forumService.list(),
  join: async ({ params, currentUser }: any) =>
    forumService.join(params.id, currentUser.id),
  leave: async ({ params, currentUser }: any) =>
    forumService.leave(params.id, currentUser.id),
};
