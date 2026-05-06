'use client';

import { deletePostAction } from "../actions";
import Link from "next/link";
import { useTransition } from "react";
import { useAuth } from "@/contexts/auth-context";

type PostActionsProps = {
  postId: number;
  postUserId: string;
};

export default function PostActions({ postId, postUserId }: PostActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { isAdmin, user } = useAuth();

  // Only the post owner or admin can edit
  const canEdit = isAdmin || (user?.name === postUserId);
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      startTransition(() => {
        deletePostAction(String(postId));
      });
    }
  };

  if (!canEdit) {
    // Admin-only delete button when not the owner
    if (isAdmin) {
      return (
        <div className="mt-12 border-t border-border pt-4 flex gap-4">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-12 border-t border-border pt-4 flex gap-4">
      <Link href={`/post/${postId}/edit`} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold">
        Edit
      </Link>
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  );
}