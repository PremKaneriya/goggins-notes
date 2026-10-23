"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertCircle, LayoutGrid, List, PenLine, Plus, RotateCw, Search } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Note, NoteEditor } from "../components/NoteEditor";
import { EmptyState, SearchField } from "../components/ui";
import { countWords, formatDateTime, formatRelative, pluralize } from "@/utils/format";

type SortKey = "updated" | "created" | "title";
type ViewMode = "grid" | "list";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recent" },
  { value: "created", label: "Created" },
  { value: "title", label: "A–Z" },
];

const SORTERS: Record<SortKey, (a: Note, b: Note) => number> = {
  updated: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  created: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  title: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
};

const PREFS_KEY = "goggins:notes-prefs";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-accent/20 px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// When searching, start the preview near the first match so it isn't clipped away
const previewText = (content: string, query: string) => {
  const index = query ? content.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const text = index > 60 ? `…${content.slice(index - 40)}` : content;
  return text.slice(0, 600);
};

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: React.ReactNode; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-xl bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          aria-label={option.title}
          title={option.title}
          onClick={() => onChange(option.value)}
          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            value === option.value
              ? "bg-surface text-ink shadow-sm ring-1 ring-line"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function NoteCard({ note, query, onOpen }: { note: Note; query: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="card group flex h-full min-h-[9.5rem] flex-col p-4 text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-xl hover:shadow-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-5"
    >
      <span className="line-clamp-2 text-[15px] font-semibold leading-snug">
        <Highlight text={note.title} query={query} />
      </span>
      <span className="mt-2 line-clamp-5 whitespace-pre-line break-words text-sm leading-relaxed text-ink-2">
        <Highlight text={previewText(note.content, query)} query={query} />
      </span>
      <span className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-ink-3">
        <span title={formatDateTime(note.updatedAt)}>{formatRelative(note.updatedAt)}</span>
        <span>{pluralize(countWords(note.content), "word")}</span>
      </span>
    </button>
  );
}

function NoteRow({ note, query, onOpen }: { note: Note; query: string; onOpen: () => void }) {
  return (
    <li>
      <button
        onClick={onOpen}
        className="flex w-full flex-col px-4 py-3.5 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none sm:px-5"
      >
        <span className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate font-medium">
            <Highlight text={note.title} query={query} />
          </span>
          <span className="shrink-0 text-xs text-ink-3" title={formatDateTime(note.updatedAt)}>
            {formatRelative(note.updatedAt)}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-1 break-all text-sm text-ink-2">
          <Highlight text={previewText(note.content, query).slice(0, 200)} query={query} />
        </span>
      </button>
    </li>
  );
}

function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-1/2" />
          <div className="flex justify-between pt-4">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

const Dashboard = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  // `id: null` means the editor is open for a new note
  const [editor, setEditor] = useState<{ id: string | null } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/auth/notes", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data: Note[] = await res.json();
      setNotes(data.filter((note) => !note.is_deleted));
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Restore view preferences, and honour ?new=1 / ?note=<id> links from other pages
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
      if (saved.sort in SORTERS) setSort(saved.sort);
      if (saved.view === "grid" || saved.view === "list") setView(saved.view);
    } catch {
      // Storage may be unavailable (private mode); defaults are fine
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has("new")) setEditor({ id: null });
    if (params.get("note")) setEditor({ id: params.get("note") });
    if (params.has("new") || params.has("note")) router.replace("/dashboard", { scroll: false });
  }, [router]);

  const savePrefs = (next: { sort: SortKey; view: ViewMode }) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures
    }
  };

  const editingNote = editor?.id ? notes.find((n) => n._id === editor.id) ?? null : null;

  // Drop a ?note=<id> link that points at a note that no longer exists
  useEffect(() => {
    if (!isLoading && editor?.id && !editingNote) setEditor(null);
  }, [isLoading, editor, editingNote]);

  // "/" focuses search, "n" starts a new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editor || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector("[aria-modal='true']")) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setEditor({ id: null });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleSaveNote = async (noteId: string, title: string, content: string) => {
    if (noteId) {
      const updatedAt = new Date().toISOString();
      const res = await fetch("/api/auth/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ noteId, title, content, updatedAt }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, title, content, updatedAt } : n)));
    } else {
      const res = await fetch("/api/auth/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setEditor(null);
      toast.success("Note created");
    }
  };

  const setNoteDeleted = async (noteId: string, isDeleted: boolean) => {
    const res = await fetch("/api/auth/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ noteId, is_deleted: isDeleted }),
    });
    if (!res.ok) throw new Error(`Failed to ${isDeleted ? "delete" : "restore"} note`);
  };

  const handleRestoreNote = async (note: Note) => {
    try {
      await setNoteDeleted(note._id, false);
      setNotes((prev) => [note, ...prev]);
      toast.success("Note restored");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't restore the note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const note = notes.find((n) => n._id === noteId);
    await setNoteDeleted(noteId, true);
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
    setEditor(null);
    toast(
      (t) => (
        <span className="flex items-center gap-4">
          Moved to Recently deleted
          {note && (
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleRestoreNote(note);
              }}
              className="font-semibold text-accent"
            >
              Undo
            </button>
          )}
        </span>
      ),
      { duration: 6000 }
    );
  };

  const query = searchQuery.trim();
  const visibleNotes = useMemo(() => {
    const q = query.toLowerCase();
    const matches = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : notes;
    return [...matches].sort(SORTERS[sort]);
  }, [notes, query, sort]);

  const openCreate = () => setEditor({ id: null });

  const subtitle = isLoading
    ? "Loading…"
    : query
      ? `${visibleNotes.length} of ${pluralize(notes.length, "note")}`
      : pluralize(notes.length, "note");

  let body: React.ReactNode;
  if (isLoading) {
    body = <NotesSkeleton />;
  } else if (loadError) {
    body = (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Couldn't load your notes"
        description="Check your connection and try again."
        action={
          <button onClick={fetchNotes} className="btn btn-secondary">
            <RotateCw className="size-4" /> Retry
          </button>
        }
      />
    );
  } else if (notes.length === 0) {
    body = (
      <EmptyState
        icon={<PenLine className="size-6" />}
        title="Your notebook is empty"
        description="Every hard thing starts with a single line. Write your first note."
        action={
          <div className="flex flex-col items-center gap-3">
            <button onClick={openCreate} className="btn btn-primary">
              <Plus className="size-4" /> Write your first note
            </button>
            <span className="hidden text-xs text-ink-3 md:block">
              or press <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-sans">N</kbd>
            </span>
          </div>
        }
      />
    );
  } else if (visibleNotes.length === 0) {
    body = (
      <EmptyState
        icon={<Search className="size-6" />}
        title="No matches"
        description={<>Nothing in your notes matches &ldquo;{query}&rdquo;.</>}
        action={
          <button onClick={() => setSearchQuery("")} className="btn btn-secondary">
            Clear search
          </button>
        }
      />
    );
  } else if (view === "list") {
    body = (
      <ul className="card divide-y divide-line overflow-hidden">
        {visibleNotes.map((note) => (
          <NoteRow key={note._id} note={note} query={query} onOpen={() => setEditor({ id: note._id })} />
        ))}
      </ul>
    );
  } else {
    body = (
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
        {visibleNotes.map((note) => (
          <NoteCard key={note._id} note={note} query={query} onOpen={() => setEditor({ id: note._id })} />
        ))}
      </div>
    );
  }

  return (
    <AppShell active="notes" title="Notes" subtitle={subtitle} onCreate={openCreate} createLabel="New note">
      {(isLoading || notes.length > 0) && (
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <SearchField
            ref={searchRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes"
            shortcutHint="/"
            className="sm:max-w-md sm:flex-1"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Segmented
              label="Sort notes"
              options={SORTS}
              value={sort}
              onChange={(value) => {
                setSort(value);
                savePrefs({ sort: value, view });
              }}
            />
            <div className="ml-auto">
              <Segmented
                label="Layout"
                options={[
                  { value: "grid", label: <LayoutGrid className="size-4" />, title: "Grid view" },
                  { value: "list", label: <List className="size-4" />, title: "List view" },
                ]}
                value={view}
                onChange={(value) => {
                  setView(value);
                  savePrefs({ sort, view: value });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {body}

      {editor && (editor.id === null || editingNote) && (
        <NoteEditor
          key={editor.id ?? "new"}
          note={editingNote}
          onClose={() => setEditor(null)}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      )}
    </AppShell>
  );
};

export default Dashboard;
