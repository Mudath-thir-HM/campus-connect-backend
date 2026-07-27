import { postService } from "../services/post.service";

export const postController = {
  create: async ({ body, currentUser }: any) =>
    postService.create(currentUser.id, body.body, body.forum_id ?? null),
  feed: async ({ query }: any) =>
    postService.feed(
      query.forum_id ?? null,
      Number(query.limit ?? 20),
      Number(query.offset ?? 0),
    ),
  vote: async ({ params, body, currentUser }: any) =>
    postService.vote(currentUser.id, params.id, body.value),
  delete: async ({ params, currentUser }: any) =>
    postService.delete(currentUser.id, params.id),
};
