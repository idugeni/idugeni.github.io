"use client";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
  className?: string;
}

export function TypewriterText({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBeforeDelete = 2000,
  delayBeforeType = 500,
  className = "",
}: TypewriterTextProps) {
  const [text, setText] = useState(words[0] ?? "");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    if (isWaiting) return;

    const currentWord = words[wordIndex];

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 1) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setIsWaiting(true);
          setTimeout(() => setIsWaiting(false), delayBeforeType);
        }
      } else {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          setIsWaiting(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsWaiting(false);
          }, delayBeforeDelete);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [
    text,
    wordIndex,
    isDeleting,
    isWaiting,
    words,
    typingSpeed,
    deletingSpeed,
    delayBeforeDelete,
    delayBeforeType,
  ]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse border-r-2 border-primary ml-1 h-[1em] inline-block align-middle" />
    </span>
  );
}
