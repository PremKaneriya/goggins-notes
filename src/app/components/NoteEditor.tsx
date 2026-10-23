"use client";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, FileDown, Loader2, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog, Dialog, useScrollLock } from "./Dialog";
import { fetchAndExportSingleNote } from "@/utils/pdfExport";
import { countWords, formatDateTime, formatRelative, pluralize } from "@/utils/format";

export type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  is_deleted: boolean;
  updatedAt: string;
};

interface NoteEditorProps {
  /** `null` opens the editor in create mode */
  note: Note | null;
  onClose: () => void;
  onSave: (noteId: string, title: string, content: string) => Promise<void>;
  onDelete?: (noteId: string) => Promise<void>;
}

// Grow a textarea to fit its content without making the scroll container jump
function useAutosize(
  ref: React.RefObject<HTMLTextAreaElement>,
  scrollerRef: React.RefObject<HTMLElement>,
  value: string
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = scrollerRef.current;
    const scrollTop = scroller?.scrollTop ?? 0;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (scroller) scroller.scrollTop = scrollTop;
  }, [ref, scrollerRef, value]);
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-2">
      {children}
    </kbd>
  );
}

export function NoteEditor({ note, onClose, onSave, onDelete }: NoteEditorProps) {
  const isCreate = !note;
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<"unsaved" | "delete" | null>(null);
  const [isMac] = useState(
    () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useScrollLock(true);
  useAutosize(titleRef, scrollerRef, title);
  useAutosize(contentRef, scrollerRef, content);

  const isDirty = isCreate
    ? title.trim() !== "" || content.trim() !== ""
    : title !== note.title || content !== note.content;
  const isComplete = title.trim() !== "" && content.trim() !== "";
  const canSave = isDirty && isComplete && !isSaving;

  useEffect(() => {
    if (isCreate) titleRef.current?.focus();
  }, [isCreate]);

  const handleSave = useCallback(async () => {
    if (!canSave) return false;
    setIsSaving(true);
    try {
      await onSave(note?._id ?? "", title, content);
      return true;
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Couldn't save your note. Try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [canSave, onSave, note, title, content]);

  const requestClose = useCallback(() => {
    if (isDirty) setConfirm("unsaved");
    else onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirm) return;
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && (key === "s" || key === "enter")) {
        e.preventDefault();
        void handleSave();
      } else if (key === "escape") {
        e.preventDefault();
        requestClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirm, handleSave, requestClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text:", err);
      toast.error("Couldn't copy to clipboard");
    }
  };

  const handleExport = async () => {
    if (!note) return;
    setIsExporting(true);
    const ok = await fetchAndExportSingleNote(note._id);
    if (!ok) toast.error("Couldn't export this note");
    setIsExporting(false);
  };

  const handleDelete = async () => {
    if (!note || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(note._id);
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Couldn't delete this note");
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  // Clicking the blank area under the text puts the caret at the end
  const focusContentEnd = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  };

  const words = countWords(content);
  const status = isSaving ? (
    <span className="flex items-center gap-1.5">
      <Loader2 className="size-3.5 animate-spin" /> Saving…
    </span>
  ) : isDirty ? (
    <span className="flex items-center gap-1.5 text-accent">
      <span className="size-1.5 rounded-full bg-accent" /> Unsaved
    </span>
  ) : isCreate ? (
    "New note"
  ) : (
    <span title={formatDateTime(note.updatedAt)}>Edited {formatRelative(note.updatedAt)}</span>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in justify-center sm:items-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm lg:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? "New note" : title || "Note"}
        className="flex h-dvh w-full animate-sheet-up flex-col bg-surface text-ink sm:h-[min(52rem,92dvh)] sm:max-w-3xl sm:animate-pop-in sm:overflow-hidden sm:rounded-3xl sm:border sm:border-line sm:shadow-2xl"
      >
        <header className="shrink-0 border-b border-line pt-[env(safe-area-inset-top)] sm:pt-0">
          <div className="flex h-14 items-center gap-1 px-2 sm:h-16 sm:px-3">
            <button onClick={requestClose} className="icon-btn" aria-label="Close note" title="Close (Esc)">
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1 truncate px-1 text-xs text-ink-3 sm:text-sm">{status}</div>

            {!isCreate && (
              <>
                <button
                  onClick={handleCopy}
                  className={`icon-btn ${copied ? "text-accent" : ""}`}
                  aria-label={copied ? "Copied" : "Copy note"}
                  title="Copy note"
                >
                  {copied ? <Check className="size-[18px]" /> : <Copy className="size-[18px]" />}
                </button>
                <button
                  onClick={handleExport}
                  className="icon-btn"
                  aria-label="Export to PDF"
                  title="Export to PDF"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="size-[18px] animate-spin" />
                  ) : (
                    <FileDown className="size-[18px]" />
                  )}
                </button>
                {onDelete && (
                  <button
                    onClick={() => setConfirm("delete")}
                    className="icon-btn hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete note"
                    title="Delete note"
                  >
                    <Trash2 className="size-[18px]" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => void handleSave()}
              disabled={!canSave}
              className="btn btn-primary ml-1 h-9 px-3.5"
              title={`Save (${isMac ? "⌘" : "Ctrl"}+S)`}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isCreate ? "Create" : "Save"}
            </button>
          </div>
        </header>

        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 cursor-text overflow-y-auto overscroll-contain"
          onClick={focusContentEnd}
        >
          <div className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-10 sm:pt-10" onClick={focusContentEnd}>
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  contentRef.current?.focus();
                }
              }}
              placeholder="Title"
              aria-label="Note title"
              className="block w-full resize-none overflow-hidden bg-transparent text-2xl font-bold leading-tight tracking-tight placeholder:text-ink-3/60 focus:outline-none sm:text-3xl"
            />
            {!isCreate && (
              <p className="mt-2 text-xs text-ink-3">Created {formatDateTime(note.createdAt)}</p>
            )}
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing. No excuses."
              aria-label="Note content"
              className="mt-5 block min-h-[40dvh] w-full resize-none overflow-hidden bg-transparent text-[17px] leading-8 text-ink placeholder:text-ink-3/60 focus:outline-none"
            />
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 text-xs text-ink-3 sm:px-5 sm:pb-2.5">
          <span>
            {pluralize(words, "word")} · {pluralize(content.length, "character")}
          </span>
          <span className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1">
              <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
              <Kbd>S</Kbd> save
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd> close
            </span>
          </span>
        </footer>
      </section>

      <Dialog
        open={confirm === "unsaved"}
        onClose={() => setConfirm(null)}
        title="Unsaved changes"
        description={
          isComplete
            ? "Save your changes before closing?"
            : "A note needs both a title and some content before it can be saved."
        }
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setConfirm(null);
                onClose();
              }}
              className="btn btn-ghost text-danger hover:bg-danger/10 hover:text-danger sm:mr-auto"
            >
              Discard
            </button>
            <button onClick={() => setConfirm(null)} className="btn btn-secondary">
              Keep editing
            </button>
            {isComplete && (
              <button
                onClick={async () => {
                  setConfirm(null);
                  const saved = await handleSave();
                  if (saved && !isCreate) onClose();
                }}
                className="btn btn-primary"
              >
                Save & close
              </button>
            )}
          </>
        }
      />

      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete this note?"
        description="It moves to Recently deleted, where you can restore it any time."
        confirmLabel="Delete"
        tone="danger"
        busy={isDeleting}
      />
    </div>
  );
}
