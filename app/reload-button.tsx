"use client";

import { Button } from "@/components/ui/button";
import { HiOutlineArrowPath } from "react-icons/hi2";

export function ReloadButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      variant="outline"
      className="font-mono border-primary/50 hover:bg-primary/10"
    >
      <HiOutlineArrowPath className="mr-2 h-4 w-4" /> RELOAD_PAGE
    </Button>
  );
}
