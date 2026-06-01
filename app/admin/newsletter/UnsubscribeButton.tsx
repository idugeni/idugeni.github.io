"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { updateNewsletterSubscriberStatus } from "@/actions/newsletter";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface UnsubscribeButtonProps { subscriberId: string; email: string; }
export function UnsubscribeButton({ subscriberId, email }: UnsubscribeButtonProps) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleUnsubscribe = async () => { setIsPending(true); try { await updateNewsletterSubscriberStatus(subscriberId, false); toast({ title: "Subscriber unsubscribed" }); router.refresh(); setOpen(false); } catch (error) { toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to unsubscribe", variant: "destructive" }); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Unsubscribe ${email}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="UNSUBSCRIBE_CONTACT" description={`Unsubscribe ${email}? This disables newsletter delivery for this contact.`} confirmLabel="UNSUBSCRIBE" variant="destructive" isPending={isPending} onConfirm={handleUnsubscribe} /></>;
}
