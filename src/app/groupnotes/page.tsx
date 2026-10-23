"use client";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  FileDown,
  FileText,
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  PenLine,
  Plus,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ConfirmDialog, Dialog, useScrollLock } from "../components/Dialog";
import { EmptyState, SearchField } from "../components/ui";
import { fetchAndExportGroupNote } from "@/utils/GroupPdfExport";
import { formatShortDate, pluralize } from "@/utils/format";

type Note = {
  _id: string;
  title: string;
  content: string;
  is_deleted: boolean;
};

type Group = {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  notes: string[];
  is_deleted: boolean;
};

type GroupInput = {
  name: string;
  description: string;
  notes: string[];
};

const TINTS = [
  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
];

// Stable per-group colour so a group keeps its look across renames
const tintFor = (id: string) =>
  TINTS[id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];

function GroupCard({ group, notes, onOpen }: { group: Group; notes: Note[]; onOpen: () => void }) {
  const preview = notes.slice(0, 3);
  return (
    <button
      onClick={onOpen}
      className="card flex h-full flex-col p-5 text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-xl hover:shadow-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tintFor(group._id)}`}>
          <FolderOpen className="size-5" />
        </span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block truncate font-semibold">{group.name}</span>
          <span className="block text-xs text-ink-3">
            {pluralize(notes.length, "note")} · {formatShortDate(group.createdAt)}
          </span>
        </span>
      </span>
      {group.description && (
        <span className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-2">{group.description}</span>
      )}
      {preview.length > 0 && (
        <span className="mt-auto block pt-4">
          <span className="block space-y-1.5 border-t border-line pt-3">
            {preview.map((note) => (
              <span key={note._id} className="flex items-center gap-2 text-sm text-ink-2">
                <FileText className="size-3.5 shrink-0 text-ink-3" />
                <span className="truncate">{note.title}</span>
              </span>
            ))}
            {notes.length > preview.length && (
              <span className="block pl-5 text-xs text-ink-3">+{notes.length - preview.length} more</span>
            )}
          </span>
        </span>
      )}
    </button>
  );
}

interface GroupPanelProps {
  group: Group;
  notes: Note[];
  isExporting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

// Full-screen on phones, slide-over panel from `sm` up
function GroupPanel({ group, notes, isExporting, onClose, onEdit, onDelete, onExport }: GroupPanelProps) {
  const titleId = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-dvh w-full animate-slide-in-right flex-col bg-surface text-ink shadow-2xl sm:max-w-xl sm:border-l sm:border-line"
      >
        <header className="shrink-0 border-b border-line pt-[env(safe-area-inset-top)]">
          <div className="flex h-14 items-center gap-1 px-2 sm:h-16 sm:px-3">
            <button onClick={onClose} className="icon-btn" aria-label="Close group">
              <ArrowLeft className="size-5 sm:hidden" />
              <X className="hidden size-5 sm:block" />
            </button>
            <div className="flex-1" />
            <button
              onClick={onExport}
              className="icon-btn"
              aria-label="Export group to PDF"
              title="Export to PDF"
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="size-[18px] animate-spin" /> : <FileDown className="size-[18px]" />}
            </button>
            <button onClick={onEdit} className="icon-btn" aria-label="Edit group" title="Edit group">
              <Pencil className="size-[18px]" />
            </button>
            <button
              onClick={onDelete}
              className="icon-btn hover:bg-danger/10 hover:text-danger"
              aria-label="Delete group"
              title="Delete group"
            >
              <Trash2 className="size-[18px]" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8">
          <span className={`grid size-12 place-items-center rounded-2xl ${tintFor(group._id)}`}>
            <FolderOpen className="size-6" />
          </span>
          <h2 id={titleId} className="mt-4 break-words text-2xl font-bold tracking-tight">
            {group.name}
          </h2>
          <p className="mt-1 text-sm text-ink-3">
            {pluralize(notes.length, "note")} · Created {formatShortDate(group.createdAt)}
          </p>
          {group.description && (
            <p className="mt-4 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink-2">
              {group.description}
            </p>
          )}

          <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-ink-3">Notes</h3>
          {notes.length > 0 ? (
            <ul className="space-y-2">
              {notes.map((note) => {
                const isOpen = !!expanded[note._id];
                return (
                  <li key={note._id} className="card overflow-hidden">
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [note._id]: !prev[note._id] }))}
                      aria-expanded={isOpen}
                      className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{note.title}</span>
                        {!isOpen && (
                          <span className="mt-0.5 line-clamp-1 break-all text-sm text-ink-2">
                            {note.content.slice(0, 200)}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={`mt-0.5 size-4 shrink-0 text-ink-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-line px-4 pb-3 pt-3">
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-2">
                          {note.content}
                        </p>
                        <Link
                          href={`/dashboard?note=${note._id}`}
                          className="btn btn-ghost -ml-2 mt-2 h-8 px-2 text-xs"
                        >
                          Open in editor <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="card px-6 py-10 text-center text-sm text-ink-2">
              No notes in this group yet.{" "}
              <button onClick={onEdit} className="font-medium text-accent hover:underline">
                Add some
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

interface GroupFormProps {
  group: Group | null;
  notes: Note[];
  onClose: () => void;
  onSubmit: (input: GroupInput) => Promise<void>;
}

function GroupForm({ group, notes, onClose, onSubmit }: GroupFormProps) {
  const formId = useId();
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  // Keeps ids of deleted notes too, so restoring a note puts it back in its group
  const [selected, setSelected] = useState<string[]>(group?.notes ?? []);
  const [filter, setFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredNotes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : notes;
  }, [notes, filter]);

  const selectedCount = notes.filter((n) => selected.includes(n._id)).length;
  const canSubmit = name.trim() !== "" && selectedCount > 0 && !isSubmitting;

  const toggleNote = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), notes: selected });
    } catch (err) {
      console.error(err);
      toast.error(group ? "Couldn't update the group" : "Couldn't create the group");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={group ? "Edit group" : "New group"}
      description="Bundle related notes together: a training plan, a book, a project."
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={!canSubmit}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : !group && <Plus className="size-4" />}
            {group ? "Save changes" : "Create group"}
          </button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 75 Hard plan"
              className="input"
              autoFocus={!group}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-description`} className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-ink-3">(optional)</span>
            </label>
            <textarea
              id={`${formId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={4}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Notes</span>
            <span className={`text-xs ${selectedCount ? "font-medium text-accent" : "text-ink-3"}`}>
              {selectedCount} selected
            </span>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter notes"
              aria-label="Filter notes"
              className="input h-10 py-2 pl-9"
            />
          </div>
          <ul className="mt-2 max-h-[40dvh] divide-y divide-line overflow-y-auto rounded-xl border border-line md:max-h-72">
            {filteredNotes.map((note) => (
              <li key={note._id}>
                <label className="flex cursor-pointer items-start gap-3 px-3.5 py-3 transition-colors hover:bg-surface-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(note._id)}
                    onChange={() => toggleNote(note._id)}
                    className="mt-0.5 size-4 shrink-0 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{note.title}</span>
                    <span className="block truncate text-xs text-ink-3">{note.content.slice(0, 120)}</span>
                  </span>
                </label>
              </li>
            ))}
            {filteredNotes.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-ink-3">
                {notes.length ? "No notes match that filter." : "You don't have any notes yet."}
              </li>
            )}
          </ul>
        </div>
      </form>
    </Dialog>
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-3">
            <div className="skeleton size-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          </div>
          <div className="skeleton mt-4 h-3 w-full" />
          <div className="skeleton mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

const GroupNotes = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  // `groupId: null` means the form is creating a new group
  const [form, setForm] = useState<{ groupId: string | null } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [notesRes, groupsRes] = await Promise.all([
        fetch("/api/auth/notes", { credentials: "include" }),
        fetch("/api/auth/groupnote", { credentials: "include" }),
      ]);
      if (notesRes.status === 401 || groupsRes.status === 401) {
        router.replace("/login");
        return;
      }
      if (!notesRes.ok || !groupsRes.ok) throw new Error("Failed to fetch data");

      const [notesData, groupsData]: [Note[], Group[]] = await Promise.all([notesRes.json(), groupsRes.json()]);
      setNotes(notesData.filter((n) => !n.is_deleted));
      setGroups(groupsData.filter((g) => !g.is_deleted));
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const noteById = useMemo(() => new Map(notes.map((n) => [n._id, n] as const)), [notes]);
  const notesFor = useCallback(
    (group: Group) =>
      (group.notes ?? []).map((id) => noteById.get(id)).filter((n): n is Note => n !== undefined),
    [noteById]
  );

  const query = searchQuery.trim().toLowerCase();
  const visibleGroups = query
    ? groups.filter(
        (g) => g.name.toLowerCase().includes(query) || (g.description ?? "").toLowerCase().includes(query)
      )
    : groups;

  const openGroup = groups.find((g) => g._id === openGroupId) ?? null;
  const formGroup = form?.groupId ? groups.find((g) => g._id === form.groupId) ?? null : null;
  const deleteGroup = groups.find((g) => g._id === deleteId) ?? null;

  const handleSubmitGroup = async (input: GroupInput) => {
    const groupId = form?.groupId;
    const res = await fetch("/api/auth/groupnote", {
      method: groupId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(groupId ? { groupId, ...input } : input),
    });
    if (!res.ok) throw new Error(`Failed to ${groupId ? "update" : "create"} group`);
    const data = await res.json();

    if (groupId) {
      setGroups((prev) => prev.map((g) => (g._id === groupId ? { ...g, ...input } : g)));
      toast.success("Group updated");
    } else {
      setGroups((prev) => [data.groupNote, ...prev]);
      toast.success("Group created");
    }
    setForm(null);
  };

  const handleDeleteGroup = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/groupnote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: deleteId, is_deleted: true }),
      });
      if (!res.ok) throw new Error("Failed to delete group");
      setGroups((prev) => prev.filter((g) => g._id !== deleteId));
      if (openGroupId === deleteId) setOpenGroupId(null);
      setDeleteId(null);
      toast.success("Group deleted");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete the group");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (groupId: string) => {
    setExportingId(groupId);
    const ok = await fetchAndExportGroupNote(groupId);
    if (!ok) toast.error("Couldn't export this group");
    setExportingId(null);
  };

  const openCreate = () => setForm({ groupId: null });

  let body: React.ReactNode;
  if (isLoading) {
    body = <GroupsSkeleton />;
  } else if (loadError) {
    body = (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Couldn't load your groups"
        description="Check your connection and try again."
        action={
          <button onClick={fetchData} className="btn btn-secondary">
            <RotateCw className="size-4" /> Retry
          </button>
        }
      />
    );
  } else if (groups.length === 0) {
    body = (
      <EmptyState
        icon={<FolderPlus className="size-6" />}
        title="No groups yet"
        description={
          notes.length
            ? "Bundle related notes into a group to keep them together and export them as one PDF."
            : "Groups collect your notes. Write a note first, then come back to group it."
        }
        action={
          notes.length ? (
            <button onClick={openCreate} className="btn btn-primary">
              <Plus className="size-4" /> Create a group
            </button>
          ) : (
            <Link href="/dashboard?new=1" className="btn btn-primary">
              <PenLine className="size-4" /> Write a note
            </Link>
          )
        }
      />
    );
  } else if (visibleGroups.length === 0) {
    body = (
      <EmptyState
        icon={<Search className="size-6" />}
        title="No matches"
        description={<>No group matches &ldquo;{searchQuery.trim()}&rdquo;.</>}
        action={
          <button onClick={() => setSearchQuery("")} className="btn btn-secondary">
            Clear search
          </button>
        }
      />
    );
  } else {
    body = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {visibleGroups.map((group) => (
          <GroupCard
            key={group._id}
            group={group}
            notes={notesFor(group)}
            onOpen={() => setOpenGroupId(group._id)}
          />
        ))}
      </div>
    );
  }

  return (
    <AppShell
      active="groups"
      title="Groups"
      subtitle={isLoading ? "Loading…" : pluralize(groups.length, "group")}
      onCreate={openCreate}
      createLabel="New group"
    >
      {groups.length > 0 && (
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search groups"
          className="mb-4 sm:mb-6 sm:max-w-md"
        />
      )}

      {body}

      {openGroup && (
        <GroupPanel
          group={openGroup}
          notes={notesFor(openGroup)}
          isExporting={exportingId === openGroup._id}
          onClose={() => setOpenGroupId(null)}
          onEdit={() => setForm({ groupId: openGroup._id })}
          onDelete={() => setDeleteId(openGroup._id)}
          onExport={() => handleExport(openGroup._id)}
        />
      )}

      {form && (
        <GroupForm
          key={form.groupId ?? "new"}
          group={formGroup}
          notes={notes}
          onClose={() => setForm(null)}
          onSubmit={handleSubmitGroup}
        />
      )}

      <ConfirmDialog
        open={deleteGroup !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteGroup}
        title={`Delete “${deleteGroup?.name ?? "group"}”?`}
        description="Only the group is removed. The notes inside stay safe in your notebook."
        confirmLabel="Delete group"
        tone="danger"
        busy={isDeleting}
      />
    </AppShell>
  );
};

export default GroupNotes;
