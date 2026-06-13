"use client";

import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons";
import { markMessageRead } from "@/actions/contact";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MarkReadButtonProps {
  messageId: string;
}

export function MarkReadButton({ messageId }: MarkReadButtonProps) {
  const router = useRouter();


  const handleMarkRead = async () => {
    try {
      await markMessageRead(messageId);
      toast.success("Message marked as read");
      router.refresh(); // Refresh server component data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark as read");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-primary hover:text-primary hover:bg-primary/20" 
      onClick={handleMarkRead}
    >
      <Check className="w-4 h-4" />
    </Button>
  );
}
