"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertCircle, Info, Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { EmptyState } from "../components/ui";
import { formatDateTime, formatRelative, formatShortDate } from "@/utils/format";

interface Note {
  _id: string;
  title: string;
  content?: string;
  userId: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  recentlyDeletedNotes: Note[];
  message: string;
}

const RecentlyDeletedNotes = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchRecentlyDeletedNotes = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/recently-deleted", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }

      const data: ApiResponse = await response.json();
      // The last edit of a deleted note is its deletion, so updatedAt doubles as "deleted at"
      setNotes(
        [...data.recentlyDeletedNotes].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRecentlyDeletedNotes();
  }, [fetchRecentlyDeletedNotes]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecentlyDeletedNotes();
  };

  const handleRestore = async (noteId: string) => {
    setRestoringId(noteId);
    try {
      const res = await fetch("/api/auth/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ noteId, is_deleted: false }),
      });
      if (!res.ok) throw new Error("Failed to restore note");
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success("Restored to your notes");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't restore the note");
    } finally {
      setRestoringId(null);
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-3 p-5">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton mt-4 h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Couldn't load deleted notes"
        description={error}
        action={
          <button onClick={handleRefresh} className="btn btn-secondary" disabled={isRefreshing}>
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} /> Retry
          </button>
        }
      />
    );
  } else if (notes.length === 0) {
    body = (
      <EmptyState
        icon={<Trash2 className="size-6" />}
        title="Nothing in here"
        description="Notes you delete show up here, so you can bring them back whenever you need them."
      />
    );
  } else {
    body = (
      <>
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 text-sm text-ink-2 sm:mb-6">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <p>We never purge deleted notes automatically. Restore anything you need, any time.</p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {notes.map((note) => (
            <li key={note._id} className="card flex flex-col p-5">
              <h3 className="truncate font-semibold">{note.title || "Untitled note"}</h3>
              {note.content && (
                <p className="mt-1.5 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-ink-2">
                  {note.content.slice(0, 400)}
                </p>
              )}
              <p className="mt-4 text-xs text-ink-3">
                <span title={formatDateTime(note.updatedAt)}>Deleted {formatRelative(note.updatedAt)}</span>
                {" · "}
                Created {formatShortDate(note.createdAt)}
              </p>
              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleRestore(note._id)}
                  disabled={restoringId !== null}
                  className="btn btn-secondary h-9 w-full"
                >
                  {restoringId === note._id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Restore
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <AppShell
      active="trash"
      title="Recently deleted"
      subtitle="Your last 10 deleted notes"
      actions={
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="btn btn-ghost h-9 px-2.5 sm:px-3"
          aria-label="Refresh"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
    >
      {body}
    </AppShell>
  );
};

export default RecentlyDeletedNotes;
