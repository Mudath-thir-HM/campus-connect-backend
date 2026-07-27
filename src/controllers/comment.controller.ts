import { commentService } from "../services/comment.service";

export const commentController = {
  create: async ({ params, body, currentUser }: any) =>
    commentService.create(
      currentUser.id,
      params.id,
      body.body,
      body.parent_comment_id ?? null,
    ),
  tree: async ({ params }: any) => commentService.treeForPost(params.id),
  vote: async ({ params, body, currentUser }: any) =>
    commentService.vote(currentUser.id, params.id, body.value),
  delete: async ({ params, currentUser }: any) =>
    commentService.delete(currentUser.id, params.id),
};
