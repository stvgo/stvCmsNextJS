'use client';

import PostActions from '../PostActions';

interface PostActionsWrapperProps {
  postId: number;
  postUserId: string;
}

export default function PostActionsWrapper({ postId, postUserId }: PostActionsWrapperProps) {
  return <PostActions postId={postId} postUserId={postUserId} />;
}