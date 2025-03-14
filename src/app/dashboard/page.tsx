"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Trash2,
  Loader2,
  Search,
  Edit,
  Calendar,
  FileText,
  Users,
  Plus,
  Menu,
  X,
  ArrowLeft,
  Check,
  LogOut,
  Copy,
  Save,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  is_deleted: boolean;
  updatedAt: string;
};

type Profile = {
  name: string;
  notesCreated: number;
  avatar?: string;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface NavbarProps {
  profile: Profile | null;
  notesCount: number;
  activeView: "notes" | "groups";
  setActiveView: (view: "notes" | "groups") => void;
  onCreateNote: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void; // Add this new prop
}

const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeView,
  setActiveView,
  onCreateNote,
  searchQuery,
  setSearchQuery,
  notesCount,
  onLogout, // Make sure to use the onLogout prop from Dashboard
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r ml-3 from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Goggins NoteBook
              </span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <button
                onClick={() => setActiveView("notes")}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeView === "notes"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </button>
              <Link href="/groupnotes">
                <button
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeView === "groups"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              />
            </div>
            <button
              onClick={onCreateNote}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="ml-2">Create Note</span>
            </button>
            <Link href="/profileinnotes" className="flex flex-col items-start">
              <div className="ml-3 relative flex items-center p-1 pl-3 pr-4 rounded-lg bg-gray-50 border border-gray-300">
                {/* Added avatar */}
                <div className="flex-shrink-0 mr-3">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={`${profile.name}'s avatar`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {profile ? getInitials(profile.name) : "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.name + "_Goggins" || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notesCount || 0} notes
                  </span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            {/* Added small profile avatar in the header for mobile */}
            <Link href="/profileinnotes" className="flex flex-col items-start">
            <div className="flex-shrink-0 mr-3">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name}'s avatar`}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium border border-gray-200">
                  {profile ? getInitials(profile.name) : "U"}
                </div>
              )}
            </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - improved for usability */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 shadow-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {/* Search bar moved to the top of mobile menu */}
            <div className="relative mb-3 mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
              />
            </div>

            {/* Create Note button added to mobile menu */}

            {/* Navigation items */}
            <button
              onClick={() => {
                setActiveView("notes");
                setIsMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg ${
                activeView === "notes"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Notes
            </button>
            <Link href="/groupnotes" className="block w-full">
              <button
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg ${
                  activeView === "groups"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Groups
              </button>
            </Link>
          </div>

        </div>
      )}
    </nav>
  );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  isFullWidth: boolean;
  toggleWidth: () => void;
  setFullPageNote: (note: Note | null) => void; // New prop for setting full-page note
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  isFullWidth,
  setFullPageNote,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format date in a more readable way
// Format date in a more readable way and use updatedAt if available
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

  return (
    <div
      className="rounded-lg border border-gray-300 hover:shadow-lg transition-shadow duration-200  
    flex flex-col p-4 w-full h-auto cursor-pointer"
    onClick={() => setFullPageNote(note)}
    >
      {note.title && (
        <div className="mb-2">
          <h3
            className={`text-base font-medium text-gray-800 ${
              expanded ? "" : "line-clamp-1"
            } cursor-pointer`}
          >
            {note.title}
          </h3>
        </div>
      )}

      <div
        className={`text-gray-700 text-sm whitespace-pre-line break-words ${
          expanded ? "line-clamp-none" : "line-clamp-2"
        } cursor-pointer mb-2`}
      >
        {note.content}
      </div>

      <div className="flex justify-between items-center mt-auto pt-2 text-xs text-gray-400">
        <div className="flex items-center">
          <Calendar size={12} className="mr-1" />
          {formatDate(note.updatedAt)}
        </div>
      </div>
    </div>
  );
};

interface FullPageNoteProps {
  note: Note;
  onClose: () => void;
  onSave: (
    noteId: string,
    title: string,
    content: string,
    updatedAt: string
  ) => void;
  onDelete?: (id: string) => void;
  isCreateMode?: boolean;
}

const FullPageNote: React.FC<FullPageNoteProps> = ({
  note,
  onClose,
  onSave,
  onDelete,
  isCreateMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastEditTime, setLastEditTime] = useState<string>(
    note?.updatedAt || note?.createdAt || new Date().toISOString()
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Update all state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLastEditTime(
        note.updatedAt || note.createdAt || new Date().toISOString()
      );
      setHasChanges(false);
      setIsEditing(isCreateMode);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note, isCreateMode]);

  useEffect(() => {
    // Focus on title input when entering edit mode or in create mode
    if ((isEditing || isCreateMode) && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing, isCreateMode]);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (contentTextareaRef.current) {
      contentTextareaRef.current.style.height = "auto";
      contentTextareaRef.current.style.height =
        contentTextareaRef.current.scrollHeight + "px";
    }
  }, [content, isEditing]);

  // Check for unsaved changes
  useEffect(() => {
    if (isCreateMode) {
      setHasChanges(title.trim() !== "" || content.trim() !== "");
    } else if (note) {
      setHasChanges(title !== note.title || content !== note.content);
    }
  }, [title, content, note, isCreateMode]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSaving(true);
      const currentTime = new Date().toISOString();
      setLastEditTime(currentTime);
      await onSave(note?._id || '', title, content, currentTime);

      if (!isCreateMode) {
        setIsEditing(false);
      }
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, note, onSave, isCreateMode]);

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note._id);
      setShowDeleteConfirmation(false);
      onClose();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not saved yet";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Copy note content to clipboard
  const copyNoteToClipboard = () => {
    const formattedContent = `${title}\n\n${content}`;
    navigator.clipboard.writeText(formattedContent).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to cancel editing, modals, or close the note
      if (e.key === "Escape") {
        if (showDeleteConfirmation) {
          setShowDeleteConfirmation(false);
        } else if (showUnsavedWarning) {
          setShowUnsavedWarning(false);
        } else if (isEditing && !isCreateMode) {
          if (hasChanges) {
            setShowUnsavedWarning(true);
          } else {
            setIsEditing(false);
          }
        } else {
          handleClose();
        }
      }

      // Ctrl+Enter or Cmd+Enter to save
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        (isEditing || isCreateMode) &&
        !showDeleteConfirmation &&
        !showUnsavedWarning
      ) {
        handleSave();
      }

      // E key to edit when not already editing and not in create mode
      if (
        e.key === "e" &&
        !isEditing &&
        !isCreateMode &&
        !showDeleteConfirmation &&
        !showUnsavedWarning &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setIsEditing(true);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isEditing, hasChanges, note, onClose, handleSave, isCreateMode, showUnsavedWarning, showDeleteConfirmation]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      {/* Unsaved Changes Dialog */}
      {showUnsavedWarning && (
        <div className="absolute z-10 bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto animate-in zoom-in-95 duration-150">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unsaved Changes</h3>
          <p className="text-sm text-gray-600 mb-4">
            You have unsaved changes. What would you like to do?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowUnsavedWarning(false);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Discard
            </button>
            <button
              onClick={() => {
                setShowUnsavedWarning(false);
                handleSave();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save & Exit
            </button>
            <button
              onClick={() => setShowUnsavedWarning(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/2 -sm animate-in fade-in-0 duration-200">
    <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all animate-in zoom-in-90 duration-200">
      {/* Close Button */}
      <button
        onClick={() => setShowDeleteConfirmation(false)}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Warning Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
      </div>

      {/* Title and Message */}
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Confirm Deletion
      </h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        Are you sure you want to delete this note? This action is permanent and cannot be reversed.
      </p>

      {/* Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={() => setShowDeleteConfirmation(false)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      <div 
        className="bg-white w-full h-full flex flex-col animate-in zoom-in-50 duration-200 sm:rounded-xl sm:max-w-5xl sm:h-[90vh] sm:m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={handleClose}
              className="mr-3 p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
              aria-label="Close full view"
            >
              <ArrowLeft size={18} />
            </button>

            {isEditing || isCreateMode ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-medium text-gray-800 w-full border-0 border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 bg-transparent px-2 py-1"
                placeholder="Note title"
              />
            ) : (
              <div className="w-full">
                <h2
                  className="text-xl font-medium text-gray-800 cursor-pointer truncate relative group px-2"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                  <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-10 transition-opacity rounded"></span>
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {isEditing || isCreateMode ? (
              <div className="flex items-center gap-2">
                {!isCreateMode && (
                  <button
                    onClick={() => {
                      if (note) {
                        setTitle(note.title);
                        setContent(note.content);
                      }
                      setIsEditing(false);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all"
                    aria-label="Cancel editing"
                    disabled={isSaving}
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className={`p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-2 ${
                    (!title.trim() || !content.trim()) ? "opacity-50 cursor-not-allowed" : ""
                  } ${isSaving ? "opacity-75" : ""}`}
                  aria-label={isCreateMode ? "Create note" : "Save note"}
                  disabled={isSaving || !title.trim() || !content.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Edit button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2"
                  aria-label="Edit note"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline text-sm">Edit</span>
                </button>

                {/* Copy button */}
                <button
                  onClick={copyNoteToClipboard}
                  className={`p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 ${
                    copySuccess ? "text-green-600 bg-green-50" : ""
                  }`}
                  aria-label="Copy note"
                  title="Copy note content"
                >
                  {copySuccess ? (
                    <>
                      <Check size={18} />
                      <span className="hidden sm:inline text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span className="hidden sm:inline text-sm">Copy</span>
                    </>
                  )}
                </button>
                
                {/* Delete button */}
                {onDelete && note && (
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                    aria-label="Delete note"
                  >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline text-sm">Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section - Made directly editable on tap */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isEditing || isCreateMode ? 'bg-white' : 'bg-gray-50/50'}`}
          onClick={() => {
            if (!isEditing && !isCreateMode) {
              setIsEditing(true);
              setTimeout(() => {
                if (contentTextareaRef.current) {
                  contentTextareaRef.current.focus();
                }
              }, 10);
            }
          }}
        >
          {isEditing || isCreateMode ? (
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none border-none focus:outline-none focus:ring-0 text-gray-800 text-lg leading-relaxed font-sans bg-white p-2"
              placeholder="Start writing..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="whitespace-pre-wrap font-sans text-gray-800 text-lg leading-relaxed cursor-pointer relative group p-2 rounded-lg hover:bg-white transition-colors">
              {content || (
                <span className="text-gray-400">Tap to start writing...</span>
              )}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t text-xs text-gray-500 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <Calendar size={14} className="mr-2 flex-shrink-0" />
              <span>
                {isCreateMode
                  ? "New note"
                  : `Last edited: ${formatDate(lastEditTime)}`}
              </span>
              {hasChanges && (
                <span className="ml-2 text-amber-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                  Unsaved changes
                </span>
              )}
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="hidden sm:flex items-center gap-4 text-gray-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-xs shadow-sm">E</kbd> to edit</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-xs shadow-sm">Esc</kbd> to cancel</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-xs shadow-sm">Ctrl+Enter</kbd> to save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<"notes" | "groups">("notes");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );
  const [showFab, setShowFab] = useState(false);
  const [fullPageNote, setFullPageNote] = useState<Note | null>(null);
  // Add new state for full-page create mode
  const [isFullPageCreate, setIsFullPageCreate] = useState(false);
  // Add new state for logout confirmation
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Show FAB after initial load, and only on small screens
    const timer = setTimeout(() => {
      if (window.innerWidth < 768) {
        setShowFab(true);
      }
    }, 1000);

    const handleResize = () => {
      setShowFab(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleGetProfile = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/auth/notes", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data.filter((note: Note) => !note.is_deleted));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
    handleGetProfile();
  }, []);

  // Unified handler for both create and edit
  const handleSaveNote = async (
    noteId: string,
    title: string,
    content: string,
    updatedAt: string
  ): Promise<void> => {
    if (!title.trim() || !content.trim()) return;

    try {
      // If noteId is provided, it's an edit operation
      if (noteId) {
        const res = await fetch("/api/auth/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ noteId, title, content, updatedAt }),
        });

        if (!res.ok) throw new Error("Failed to update note");

        // Update the notes state with the new updatedAt timestamp
        setNotes(
          notes.map((n) =>
            n._id === noteId ? { ...n, title, content, updatedAt } : n
          )
        );

        // If this was triggered from the modal, close it
        if (selectedNote && selectedNote._id === noteId) {
          setIsEditModalOpen(false);
        }

        // If this was triggered from full-page view, update the fullPageNote
        if (fullPageNote && fullPageNote._id === noteId) {
          setFullPageNote({ ...fullPageNote, title, content, updatedAt });
        }
      }
      // Otherwise it's a create operation
      else {
        setIsCreating(true);
        const res = await fetch("/api/auth/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to create note");

        const data = await res.json();
        setNotes([data.note, ...notes]);

        // Close whatever create UI was open
        setIsCreateModalOpen(false);
        setIsFullPageCreate(false);
        setIsCreating(false);
      }
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  // Add new function to handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to logout");
      toast.success("Logged out successfully!");
      router.push("/login");

      // The API will handle redirecting to the login page
      // No need to do anything else here as the redirect happens server-side
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch("/api/auth/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ noteId, is_deleted: true }),
      });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNoteWidth = (noteId: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modified function to handle create note button click
  const handleCreateNoteClick = () => {
    // Open the full-page create interface instead of the modal
    setIsFullPageCreate(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-40 h-6 bg-gray-300 animate-pulse rounded"></div>
        <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
      </div>

      {/* Notes List Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-white shadow-md rounded-lg animate-pulse"
          >
            {/* Title */}
            <div className="w-3/4 h-5 bg-gray-300 rounded mb-3"></div>

            {/* Body (3 lines) */}
            <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-2/3 h-4 bg-gray-300 rounded"></div>

            {/* Footer (Date & Actions) */}
            <div className="flex justify-between items-center mt-4">
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
              <div className="w-16 h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        profile={profile}
        activeView={activeView}
        setActiveView={setActiveView}
        onCreateNote={handleCreateNoteClick} // Modified to use our new function
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notesCount={notes.length}
        onLogout={() => setIsLogoutDialogOpen(true)} // Add new prop to trigger logout dialog
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={(note) => {
                  setSelectedNote(note);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDeleteNote}
                isFullWidth={!!expandedNotes[note._id]}
                toggleWidth={() => toggleNoteWidth(note._id)}
                setFullPageNote={setFullPageNote}
              />
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-16 col-span-full bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No notes found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery
                      ? `No notes matching "${searchQuery}"`
                      : "Create your first note to get started"}
                  </p>
                  <button
                    onClick={handleCreateNoteClick}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {searchQuery ? "Create new note" : "Create your first note"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showFab && (
        <button
          onClick={handleCreateNoteClick}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center md:hidden z-20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all"
          aria-label="Create new note"
        >
          <Plus size={24} />
        </button>
      )}

      {/* We keep the modal for backward compatibility, but we could remove it */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Note"
      >
        <NoteForm
          onSubmit={(title, content) =>
            handleSaveNote("", title, content, new Date().toISOString())
          }
          submitButtonText="Create Note"
          isSubmitting={isCreating}
        />
      </Modal>

      {/* Modal for editing notes (when not using full-page) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Note"
      >
        <NoteForm
          note={selectedNote}
          onSubmit={(title, content) => {
            if (selectedNote) {
              handleSaveNote(
                selectedNote._id,
                title,
                content,
                selectedNote.updatedAt
              );
            }
          }}
          submitButtonText="Save Changes"
        />
      </Modal>

      {/* Logout confirmation dialog */}
      <Modal
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        title="Confirm Logout"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsLogoutDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* Add the FullPageNote component when a note is selected for viewing/editing */}
      {fullPageNote && (
        <FullPageNote
          note={fullPageNote}
          onClose={() => setFullPageNote(null)}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      )}

      {/* Add the FullPageNote component for note creation */}
      {isFullPageCreate && (
        <FullPageNote
          onClose={() => setIsFullPageCreate(false)}
          onSave={handleSaveNote}
          isCreateMode={true}
          note={{
            _id: "",
            title: "",
            content: "",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            is_deleted: false,
          }}
        />
      )}
    </div>
  );
};

const NoteForm: React.FC<{
  note?: Note | null;
  onSubmit: (title: string, content: string) => void;
  submitButtonText: string;
  isSubmitting?: boolean;
}> = ({ note, onSubmit, submitButtonText, isSubmitting }) => {
  const [localTitle, setLocalTitle] = useState(note?.title || "");
  const [localContent, setLocalContent] = useState(note?.content || "");
  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });
  const [touched, setTouched] = useState({
    title: false,
    content: false,
  });

  useEffect(() => {
    setLocalTitle(note?.title || "");
    setLocalContent(note?.content || "");
    setErrors({ title: "", content: "" });
    setTouched({ title: false, content: false });
  }, [note]);

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    return "";
  };

  const handleBlur = (field: "title" | "content") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(
        field,
        field === "title" ? localTitle : localContent
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const titleError = validateField("title", localTitle);
    const contentError = validateField("content", localContent);

    setErrors({
      title: titleError,
      content: contentError,
    });

    setTouched({
      title: true,
      content: true,
    });

    if (!titleError && !contentError) {
      onSubmit(localTitle, localContent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={localTitle}
          onChange={(e) => {
            setLocalTitle(e.target.value);
            if (touched.title) {
              setErrors((prev) => ({
                ...prev,
                title: validateField("title", e.target.value),
              }));
            }
          }}
          onBlur={() => handleBlur("title")}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
              ${
                errors.title && touched.title
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
          placeholder="Enter note title..."
        />
        {errors.title && touched.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Content
        </label>
        <textarea
          id="content"
          value={localContent}
          onChange={(e) => {
            setLocalContent(e.target.value);
            if (touched.content) {
              setErrors((prev) => ({
                ...prev,
                content: validateField("content", e.target.value),
              }));
            }
          }}
          onBlur={() => handleBlur("content")}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48 text-base resize-none transition-all
              ${
                errors.content && touched.content
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
          placeholder="Enter note content..."
        />
        {errors.content && touched.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={
          isSubmitting ||
          (touched.title &&
            touched.content &&
            (!!errors.title || !!errors.content))
        }
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-3 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium transition-all"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {submitButtonText}
      </button>
    </form>
  );
};

export default Dashboard;
