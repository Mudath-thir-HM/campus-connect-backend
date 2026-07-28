import { commentRepository } from "../repositories/comment.repository";
import { voteRepository } from "../repositories/vote.repository";
import { postRepository } from "../repositories/post.repository";
import { AuthError } from "./auth.service";
import type { CommentWithAuthor } from "../db/models/comment.model";
import { notificationService } from "./notification.service";

interface CommentNode extends CommentWithAuthor {
  replies: CommentNode[];
}

export const commentService = {
  async create(
    userId: string,
    postId: string,
    body: string,
    parentCommentId: string | null,
  ) {
    const post = await postRepository.findById(postId);
    if (!post) throw new AuthError("POST_NOT_FOUND", "Post not found");

    if (parentCommentId) {
      const parent = await commentRepository.findById(parentCommentId);
      if (!parent || parent.post_id !== postId) {
        throw new AuthError(
          "PARENT_COMMENT_NOT_FOUND",
          "Parent comment not found on this post",
        );
      }
    }

    const comment = await commentRepository.create(
      postId,
      userId,
      body,
      parentCommentId,
    );

    if (post.user_id !== userId) {
      notificationService.notify(
        post.user_id,
        "forum_reply",
        "New reply",
        `Someone replied to your post`,
        postId,
      );
    }

    return comment;
  },

  // builds the nested tree from a flat list — pulled once, nested in memory
  async treeForPost(postId: string): Promise<CommentNode[]> {
    console.log("[comment.service] treeForPost called with postId:", postId);
    const flat = await commentRepository.listByPost(postId);

    const byId = new Map<string, CommentNode>();
    flat.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

    const roots: CommentNode[] = [];
    for (const comment of byId.values()) {
      if (comment.parent_comment_id) {
        const parent = byId.get(comment.parent_comment_id);
        parent?.replies.push(comment);
      } else {
        roots.push(comment);
      }
    }
    return roots;
  },

  async vote(userId: string, commentId: string, value: 1 | -1 | 0) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new AuthError("COMMENT_NOT_FOUND", "Comment not found");

    if (value === 0) {
      await voteRepository.removeCommentVote(userId, commentId);
    } else {
      await voteRepository.upsertCommentVote(userId, commentId, value);
    }
    return { message: "Vote recorded" };
  },

  async delete(userId: string, commentId: string) {
    await commentRepository.delete(commentId, userId);
    return { message: "Comment deleted" };
  },
};
