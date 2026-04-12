"use server";

import { revalidatePath } from "next/cache";
import {
    deletePost as deletePostFromApi,
    updatePost as updatePostFromApi,
    createPost as createPostFromApi
} from "@/lib/api";
import { redirect } from "next/navigation";
import type { UpdatePost, CreatePost } from "@/types/post";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/lib/api-errors";

export async function createPostAction(data: CreatePost) {
    if (!data.title?.trim()) {
        return { error: 'Title is required.' };
    }

    try {
        await createPostFromApi({
            title: data.title,
            user_id: data.user_id,
            content_blocks: data.content_blocks,
        });
        revalidatePath('/');
    } catch (error) {
        logger.error('Failed to create post:', error);
        return { error: getErrorMessage(error) };
    }
    redirect('/');
}

export async function deletePostAction(id: string) {
    try {
        await deletePostFromApi(id);
        revalidatePath("/");
    } catch (error) {
        logger.error('Failed to delete post:', error);
        return { error: getErrorMessage(error) };
    }
}

export async function updatePostAction(data: UpdatePost) {
    try {
        await updatePostFromApi(data);
        revalidatePath(`/post/${data.id}`);
        revalidatePath(`/`);
    } catch (error) {
        logger.error('Failed to update post:', error);
        return { error: getErrorMessage(error) };
    }
    redirect(`/post/${data.id}`);
}
