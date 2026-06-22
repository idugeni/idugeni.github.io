"use client";

import { useState, useEffect, useRef } from "react";
import { toggleBlogLike } from "@/actions/blog";
import { toast } from "sonner";
import { Heart, Share2, MessageSquare, Check } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/lib/utils";

export function ViewTracker({ articleId }: { articleId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`/api/blog/${articleId}/track-view`, { method: "POST", keepalive: true, cache: "no-store" }).catch(() => {});
  }, [articleId]);

  return null;
}

export function BlogActionBar({
  articleId,
  initialViewCount,
  initialLikeCount,
  commentCount,
  onToggleComments,
}: {
  articleId: string;
  initialViewCount: number;
  initialLikeCount: number;
  commentCount: number;
  onToggleComments: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshStats = async () => {
    try {
      const res = await fetch(`/api/blog/${articleId}/track-view`, { method: "GET", cache: "no-store" });
      if (!res.ok) return;
      const stats = (await res.json()) as { jumlahView?: number; jumlahLike?: number };
      if (typeof stats.jumlahLike === "number") setLikeCount(stats.jumlahLike);
    } catch {}
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    setLikeLoading(true);
    try {
      await toggleBlogLike(articleId);
    } catch {
      setLiked(liked);
      setLikeCount(initialLikeCount);
    } finally {
      setLikeLoading(false);
      void refreshStats();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        className={`font-mono border-primary/50 hover:bg-primary/20 ${liked ? "bg-primary/20 text-primary" : ""}`}
        onClick={handleLike}
        disabled={likeLoading}
      >
        <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-primary" : ""} ${likeLoading ? "animate-pulse" : ""}`} />
        {likeCount} LIKES
      </Button>
      <Button variant="outline" className="font-mono border-primary/50 hover:bg-primary/20" onClick={handleShare}>
        {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
        {copied ? "COPIED" : "SHARE"}
      </Button>
      <Button variant="outline" className="font-mono border-primary/50 hover:bg-primary/20" onClick={onToggleComments}>
        <MessageSquare className="mr-2 h-4 w-4" />
        {commentCount} COMMENTS
      </Button>
    </div>
  );
}
