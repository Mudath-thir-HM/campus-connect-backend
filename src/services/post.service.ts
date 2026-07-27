import { postRepository } from "../repositories/post.repository";
import { forumRepository } from "../repositories/forum.repository";
import { voteRepository } from "../repositories/vote.repository";
import { AuthError } from "./auth.service";

export const postService = {
  async create(userId: string, body: string, forumId: string | null) {
    if (forumId) {
      const isMember = await forumRepository.isMember(forumId, userId);
      if (!isMember)
        throw new AuthError(
          "NOT_A_MEMBER",
          "Join the forum before posting in it",
        );
    }
    return postRepository.create(userId, forumId, body);
  },

  async feed(forumId: string | null, limit: number, offset: number) {
    return forumId
      ? postRepository.listByForum(forumId, limit, offset)
      : postRepository.listGeneral(limit, offset);
  },

  async vote(userId: string, postId: string, value: 1 | -1 | 0) {
    const post = await postRepository.findById(postId);
    if (!post) throw new AuthError("POST_NOT_FOUND", "Post not found");

    if (value === 0) {
      await voteRepository.removePostVote(userId, postId);
    } else {
      await voteRepository.upsertPostVote(userId, postId, value);
    }
    return { message: "Vote recorded" };
  },

  async delete(userId: string, postId: string) {
    await postRepository.delete(postId, userId);
    return { message: "Post deleted" };
  },
};
