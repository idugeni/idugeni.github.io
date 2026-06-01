"use client";

import { useEffect } from "react";

const blockedZoomKeys = new Set(["+", "-", "=", "0"]);

function isZoomShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && blockedZoomKeys.has(event.key);
}

export function ZoomLock() {
  useEffect(() => {
    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    const preventWheelZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const preventKeyboardZoom = (event: KeyboardEvent) => {
      if (isZoomShortcut(event)) {
        event.preventDefault();
      }
    };

    document.documentElement.dataset.zoomLocked = "true";

    window.addEventListener("wheel", preventWheelZoom, { passive: false });
    window.addEventListener("keydown", preventKeyboardZoom, { passive: false });
    window.addEventListener("gesturestart", preventGestureZoom, { passive: false });
    window.addEventListener("gesturechange", preventGestureZoom, { passive: false });
    window.addEventListener("gestureend", preventGestureZoom, { passive: false });

    return () => {
      delete document.documentElement.dataset.zoomLocked;
      window.removeEventListener("wheel", preventWheelZoom);
      window.removeEventListener("keydown", preventKeyboardZoom);
      window.removeEventListener("gesturestart", preventGestureZoom);
      window.removeEventListener("gesturechange", preventGestureZoom);
      window.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  return null;
}
