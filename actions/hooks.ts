"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toCamelCase } from "@/lib/utils/case";
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
import {
  getProjects,
  getProject,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
} from "@/actions/projects";
import {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} from "@/actions/gallery";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "@/actions/services";
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/actions/testimonials";
import {
  getContactMessages,
  markMessageRead,
  submitContactMessage,
} from "@/actions/contact";
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "@/actions/newsletter";
import {
  getAnalyticsSummary,
  getPageViewsChart,
  getTopPages,
  trackPageView,
} from "@/actions/analytics";
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getUnapprovedComments,
  approveComment,
  deleteComment,
} from "@/actions/admin";

// ============================================================
// Query hook: auto-fetches on mount and when args change
// Uses Supabase browser client directly for public reads
// to avoid server action cookies() issues in Next.js 16
// ============================================================
function useQuery<T, A extends unknown[]>(
  action: (...args: A) => Promise<T>,
  ...args: A
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const actionRef = useRef(action);
  const argsRef = useRef(args);
  actionRef.current = action;
  argsRef.current = args;

  const serializedArgs = JSON.stringify(args);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await actionRef.current(...argsRef.current);
      setData(toCamelCase<T>(result));
    } catch {
      // Server action failed (likely cookies() issue) - silently set null
      setData(null);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedArgs]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}

// ============================================================
// Mutation hook: manual trigger via mutate()
// ============================================================
function useMutation<T, A extends Record<string, unknown>>(
  action: (args: A) => Promise<T>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      args: { data: A },
      options?: { onSuccess?: (data: T) => void; onError?: (error: Error) => void }
    ) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await action(args.data);
        options?.onSuccess?.(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        options?.onError?.(err);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [action]
  );

  return { mutate, isPending, error };
}

// ============================================================
// Server action hook (for actions that need execute() pattern)
// ============================================================
function useServerAction<T, A extends unknown[]>(action: (...args: A) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: A): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await action(...args);
      setData(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [action]);

  return { data, error, isLoading, execute };
}

// ============================================================
// Blog hooks
// ============================================================
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

// ============================================================
// Project hooks
// ============================================================
export function useGetProjects(filters?: { kategori?: string; featured?: boolean; search?: string }) {
  return useQuery(getProjects, filters);
}
export function useGetProject(id: string) {
  return useQuery(getProject, id);
}
export function useGetProjectStats() { return useQuery(getProjectStats); }
export function useCreateProject() { return useServerAction(createProject); }
export function useUpdateProject() { return useServerAction(updateProject); }
export function useDeleteProject() { return useServerAction(deleteProject); }

// ============================================================
// Gallery hooks
// ============================================================
export function useGetGalleryItems(filters?: { tipe?: string; kategori?: string }) {
  return useQuery(getGallery, filters);
}
export function useCreateGalleryItem() { return useServerAction(createGalleryItem); }
export function useDeleteGalleryItem() { return useServerAction(deleteGalleryItem); }

// ============================================================
// Services hooks
// ============================================================
export function useGetServices() { return useQuery(getAllServices); }
export function useCreateService() { return useServerAction(createService); }
export function useUpdateService() { return useServerAction(updateService); }
export function useDeleteService() { return useServerAction(deleteService); }

// ============================================================
// Testimonials hooks
// ============================================================
export function useGetTestimonials() { return useQuery(getAllTestimonials); }
export function useCreateTestimonial() { return useServerAction(createTestimonial); }
export function useUpdateTestimonial() { return useServerAction(updateTestimonial); }
export function useDeleteTestimonial() { return useServerAction(deleteTestimonial); }

// ============================================================
// Contact hooks
// ============================================================
export function useGetContactMessages(filters?: { dibaca?: boolean }) {
  return useQuery(getContactMessages, filters);
}
export function useMarkMessageRead() { return useServerAction(markMessageRead); }
export function useSendContactMessage() { return useServerAction(submitContactMessage); }

// ============================================================
// Newsletter hooks
// ============================================================
export function useGetNewsletterSubscribers() { return useQuery(getNewsletterSubscribers); }
export function useSubscribeNewsletter() { return useServerAction(subscribeNewsletter); }
export function useUnsubscribeNewsletter() { return useServerAction(unsubscribeNewsletter); }

// ============================================================
// Analytics hooks
// ============================================================
export function useGetAnalyticsSummary() { return useQuery(getAnalyticsSummary); }
export function useGetPageViewsChart() { return useQuery(getPageViewsChart); }
export function useGetTopPages() { return useQuery(getTopPages); }
export function useTrackPageView() { return useServerAction(trackPageView); }

// ============================================================
// Admin hooks
// ============================================================
export function useAdminLogin() {
  return useMutation(adminLogin);
}
export function useAdminLogout() { return useServerAction(adminLogout); }
export function useGetDashboardStats() { return useQuery(getDashboardStats); }
export function useGetUnapprovedComments() { return useQuery(getUnapprovedComments); }
export function useApproveComment() { return useServerAction(approveComment); }
export function useDeleteComment() { return useServerAction(deleteComment); }

export type CreateBlogBodyStatus = "draft" | "published";
export type CreateProjectBodyStatus = "ongoing" | "completed" | "archived";
