"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { deleteBlogArticle } from "@/actions/blog";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface DeleteBlogArticleButtonProps { articleSlug: string; articleTitle: string; }
export function DeleteBlogArticleButton({ articleSlug, articleTitle }: DeleteBlogArticleButtonProps) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleDelete = async () => { setIsPending(true); try { await deleteBlogArticle(articleSlug); toast.success("Article deleted successfully"); router.refresh(); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete article"); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Delete ${articleTitle}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_ARTICLE" description={`Delete article \"${articleTitle}\"? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" isPending={isPending} onConfirm={handleDelete} /></>;
}
