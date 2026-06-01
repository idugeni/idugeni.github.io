"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { deleteService } from "@/actions/services";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface DeleteServiceButtonProps { serviceId: string; serviceName: string; }
export function DeleteServiceButton({ serviceId, serviceName }: DeleteServiceButtonProps) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleDelete = async () => { setIsPending(true); try { await deleteService(serviceId); toast({ title: "Service deleted successfully" }); router.refresh(); setOpen(false); } catch (error) { toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete service", variant: "destructive" }); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Delete ${serviceName}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_SERVICE" description={`Delete service \"${serviceName}\"? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" isPending={isPending} onConfirm={handleDelete} /></>;
}
