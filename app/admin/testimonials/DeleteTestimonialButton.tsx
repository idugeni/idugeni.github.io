"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { deleteTestimonial } from "@/actions/testimonials";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface DeleteTestimonialButtonProps { testimonialId: string; testimonialName: string; }
export function DeleteTestimonialButton({ testimonialId, testimonialName }: DeleteTestimonialButtonProps) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleDelete = async () => { setIsPending(true); try { await deleteTestimonial(testimonialId); toast({ title: "Testimonial deleted successfully" }); router.refresh(); setOpen(false); } catch (error) { toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete testimonial", variant: "destructive" }); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Delete testimonial from ${testimonialName}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_TESTIMONIAL" description={`Delete testimonial from \"${testimonialName}\"? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" isPending={isPending} onConfirm={handleDelete} /></>;
}
