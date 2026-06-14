"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getBlogArticles,
  getBlogArticle,
  getBlogStats,
  createBlogArticle,
  updateBlogArticle,
  deleteBlogArticle,
  toggleBlogLike,
  trackArticleView,
  createBlogComment,
  getBlogCategories,
} from "@/actions/blog";
import { generateBlogArticleWithAi, generateBlogSeoPlanWithAi } from "@/actions/blog-ai";

export function useGetBlogArticles(filters?: { kategori?: string; search?: string; status?: string }) {
  return useQuery(getBlogArticles, filters);
}
export function useGetBlogArticle(slug: string) {
  return useQuery(getBlogArticle, slug);
}
export function useGetBlogStats() { return useQuery(getBlogStats); }
export function useCreateBlogArticle() { return useServerAction(createBlogArticle); }
export function useUpdateBlogArticle() { return useServerAction(updateBlogArticle); }
export function useDeleteBlogArticle() { return useServerAction(deleteBlogArticle); }
export function useToggleBlogLike() { return useServerAction(toggleBlogLike); }
export function useTrackArticleView() { return useServerAction(trackArticleView); }
export function useCreateBlogComment() { return useServerAction(createBlogComment); }
export function useGenerateBlogArticleWithAi() { return useServerAction(generateBlogArticleWithAi); }
export function useGenerateBlogSeoPlanWithAi() { return useServerAction(generateBlogSeoPlanWithAi); }
export function useGetBlogCategories() { return useQuery(getBlogCategories); }

export type CreateBlogBodyStatus = "draft" | "published";
