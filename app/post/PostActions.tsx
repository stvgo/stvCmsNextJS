'use client';

import { deletePostAction } from "../actions";
import Link from "next/link";
import { useTransition } from "react";

type PostActionsProps = {
  postId: number;
};

export default function PostActions({ postId }: PostActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      startTransition(() => {
        deletePostAction(String(postId));
      });
    }
  };

  return (
    <div className="mt-12 border-t border-border pt-4 flex gap-4">
      <Link href={`/post/${postId}/edit`} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold">
        Edit
      </Link>
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