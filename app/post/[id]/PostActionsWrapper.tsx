'use client';

import PostActions from '../PostActions';

interface PostActionsWrapperProps {
  postId: number;
}

export default function PostActionsWrapper({ postId }: PostActionsWrapperProps) {
  return <PostActions postId={postId} />;
}