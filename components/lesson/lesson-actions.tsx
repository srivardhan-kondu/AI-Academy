"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2 } from "lucide-react";
import { markLessonComplete, toggleBookmark } from "@/app/actions/learning";
import type { BookmarkType } from "@/lib/db/schema";

export function BookmarkButton({
  type,
  id,
  initial,
  signedIn,
}: {
  type: BookmarkType;
  id: string;
  initial: boolean;
  signedIn: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!signedIn) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="btn-secondary btn-sm"
        aria-pressed={on}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await toggleBookmark(type, id);
            if ("error" in r) setMsg(r.error);
            else setOn(r.bookmarked);
          })
        }
      >
        {on ? <BookmarkCheck aria-hidden className="h-4 w-4" /> : <Bookmark aria-hidden className="h-4 w-4" />}
        {on ? "Bookmarked" : "Bookmark"}
      </button>
      {msg && <span className="text-xs text-red-700">{msg}</span>}
    </span>
  );
}

export function CompleteLessonButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [done, setDone] = useState(completed);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) {
    return (
      <p className="flex items-center gap-2 font-semibold text-emerald-700">
        <CheckCircle2 aria-hidden className="h-5 w-5" /> Lesson completed
      </p>
    );
  }
  return (
    <div>
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await markLessonComplete(lessonId);
            setMsg(r?.message ?? null);
            if (r?.ok) setDone(true);
          })
        }
      >
        <CheckCircle2 aria-hidden className="h-4 w-4" />
        {pending ? "Saving…" : "Mark lesson complete"}
      </button>
      {msg && (
        <p role="status" className="mt-2 text-sm text-slate-700">
          {msg}
        </p>
      )}
    </div>
  );
}
