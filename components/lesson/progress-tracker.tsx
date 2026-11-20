"use client";

import { useEffect, useRef } from "react";
import { saveProgress } from "@/app/actions/learning";

/**
 * Observes lesson blocks as the learner scrolls and records the furthest block
 * reached. Progress only ever moves forward on the server.
 */
export function ProgressTracker({ lessonId, blockIds, enabled }: { lessonId: string; blockIds: string[]; enabled: boolean }) {
  const furthest = useRef(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || blockIds.length === 0) return;
    const send = (index: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const percent = ((index + 1) / blockIds.length) * 100;
        saveProgress(lessonId, blockIds[index], percent).catch(() => {});
      }, 600);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.blockId;
          const index = id ? blockIds.indexOf(id) : -1;
          if (index > furthest.current) {
            furthest.current = index;
            send(index);
          }
        }
      },
      { rootMargin: "0px 0px -30% 0px", threshold: 0.1 },
    );
    document.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lessonId, blockIds, enabled]);

  return null;
}
