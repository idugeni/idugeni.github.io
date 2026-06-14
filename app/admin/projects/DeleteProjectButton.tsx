"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { deleteProject } from "@/actions/projects";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface DeleteProjectButtonProps { projectId: string; projectName: string; }
export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleDelete = async () => { setIsPending(true); try { await deleteProject(projectId); toast.success("Project deleted successfully"); router.refresh(); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete project"); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Delete ${projectName}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_PROJECT" description={`Delete project \"${projectName}\"? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" isPending={isPending} onConfirm={handleDelete} /></>;
}
