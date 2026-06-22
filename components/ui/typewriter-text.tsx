"use client";
import { useState, useEffect, useRef, useCallback } from "react";

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
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeouts();
    };
  }, [clearTimeouts]);

  useEffect(() => {
    if (words.length === 0 || !mountedRef.current) return;

    const currentWord = words[wordIndex];

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
        if (text.length === 1) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setIsDeleting(true);
          }, delayBeforeType);
        }
      } else {
        setText(currentWord.substring(0, text.length + 1));
        if (text.length === currentWord.length) {
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setIsDeleting(true);
          }, delayBeforeDelete);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeouts();
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, delayBeforeDelete, delayBeforeType, clearTimeouts]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse border-r-2 border-primary ml-1 h-[1em] inline-block align-middle" />
    </span>
  );
}
