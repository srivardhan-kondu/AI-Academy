"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavSection = { id: string; title: string };

/** Offset from the viewport top (in rem, so it tracks the scaled header) at which a section counts as "being read". */
const READ_LINE_REM = 10.625;

/** Index of the section currently being read, or -1 while still above the first one. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      let current = -1;
      const line = READ_LINE_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      }
      // At the very bottom of the page the last section is the one being read.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && ids.length) current = ids.length - 1;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);
  return active;
}

/** Slim bar pinned under the site header once the learner is inside the lesson body. */
export function LessonProgressBar({ sections, lessonTitle, moduleTitle }: { sections: NavSection[]; lessonTitle: string; moduleTitle: string }) {
  const ids = useStableIds(sections);
  const active = useActiveSection(ids);
  const visible = active >= 0;
  const current = Math.max(active, 0) + 1;
  const percent = Math.round((current / Math.max(sections.length, 1)) * 100);
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-[4.1875rem] z-30 border-b border-line bg-paper/95 backdrop-blur transition-[opacity,transform] duration-200 supports-[backdrop-filter]:bg-paper/85",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="container-page flex h-[3.5625rem] items-center gap-6">
        <p className="min-w-0 flex-1 truncate text-[0.9062rem] text-ink-2">
          <span className="font-medium text-ink">{lessonTitle}</span>
          <span className="hidden sm:inline"> · {moduleTitle}</span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[0.9062rem] tabular-nums text-ink-2">
            Section {current} of {sections.length}
          </span>
          <div
            className="hidden h-[5px] w-[9.375rem] overflow-hidden rounded-full bg-surface-2 sm:block"
            role="progressbar"
            aria-label="Lesson sections read"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="h-full rounded-full bg-brand-2 transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Vertical "In this lesson" rail with done / current / upcoming states. */
export function LessonToc({ sections }: { sections: NavSection[] }) {
  const ids = useStableIds(sections);
  const active = Math.max(useActiveSection(ids), 0);
  return (
    <nav aria-label="In this lesson">
      <p className="text-[0.9062rem] font-medium text-ink-2">In this lesson</p>
      <ol className="mt-3">
        {sections.map((s, i) => {
          const state = i < active ? "done" : i === active ? "current" : "todo";
          const last = i === sections.length - 1;
          return (
            <li key={s.id} className="relative">
              {!last && (
                <span
                  aria-hidden
                  className={cn("absolute top-[19px] left-[5px] h-[calc(100%-12px)] w-[1.5px] rounded-full", i < active ? "bg-brand-2" : "bg-line")}
                />
              )}
              <a
                href={`#${s.id}`}
                aria-current={state === "current" ? "location" : undefined}
                className={cn(
                  "group flex items-start gap-3 rounded-[6px] py-[7px] text-[0.9688rem] leading-[1.35] transition-colors",
                  state === "current" ? "font-semibold text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-[3px] h-[0.6875rem] w-[11px] shrink-0 rounded-full border-[1.5px] transition-colors",
                    state === "done" && "border-brand-2 bg-brand-2",
                    state === "current" && "border-brand bg-brand ring-[3px] ring-brand-weak",
                    state === "todo" && "border-line bg-paper group-hover:border-ink-3",
                  )}
                />
                <span>{s.title}</span>
                {state === "done" && <span className="sr-only">(read)</span>}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Keeps the id array referentially stable across renders so effects don't re-subscribe. */
function useStableIds(sections: NavSection[]) {
  const key = sections.map((s) => s.id).join("|");
  const [ids, setIds] = useState(() => sections.map((s) => s.id));
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setIds(sections.map((s) => s.id));
  }
  return ids;
}
