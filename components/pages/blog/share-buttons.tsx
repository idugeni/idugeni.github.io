"use client";

import { FiTwitter, FiFacebook, FiLinkedin, FiShare2, FiMessageCircle } from "react-icons/fi";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const shareLinks = [
  {
    name: "Twitter",
    icon: FiTwitter,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Facebook",
    icon: FiFacebook,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    icon: FiLinkedin,
    href: (url: string, title: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "WhatsApp",
    icon: FiMessageCircle,
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
];

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="w-4 h-4" />
        </a>
      ))}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          className="w-9 h-9 flex items-center justify-center border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          aria-label="Share"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
