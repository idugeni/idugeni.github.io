"use client";

import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons";
import { markMessageRead } from "@/actions/contact";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface MarkReadButtonProps {
  messageId: string;
}

export function MarkReadButton({ messageId }: MarkReadButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleMarkRead = async () => {
    try {
      await markMessageRead(messageId);
      toast({ title: "Message marked as read" });
      router.refresh(); // Refresh server component data
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to mark as read",
        variant: "destructive" 
      });
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
