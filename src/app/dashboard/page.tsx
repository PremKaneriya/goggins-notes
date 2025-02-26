"use client";
import React, { useEffect, useState } from "react";
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
    ChevronDown,
    ChevronUp
} from "lucide-react";
import Link from "next/link";

type Note = {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    is_deleted: boolean;
};

type Profile = {
    name: string;
    notesCreated: number;
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

interface NavbarProps {
    profile: Profile | null;
    activeView: "notes" | "groups";
    setActiveView: (view: "notes" | "groups") => void;
    onCreateNote: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    profile,
    activeView,
    setActiveView,
    onCreateNote,
    searchQuery,
    setSearchQuery
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">NotesApp</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <button
                                onClick={() => setActiveView("notes")}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                    activeView === "notes"
                                        ? "border-blue-500 text-gray-900"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Notes
                            </button>
                            <Link href="/groupnotes">
                                <button
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        activeView === "groups"
                                            ? "border-blue-500 text-gray-900"
                                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    }`}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Groups
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        <div className="relative w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <button
                            onClick={onCreateNote}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            New Note
                        </button>
                        <div className="ml-3 relative">
                            <div className="flex items-center">
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-700">
                                        {profile?.name + "_Goggins" || "User"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {profile?.notesCreated || 0} notes
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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

            {/* Mobile menu - significantly improved */}
            {isMenuOpen && (
                <div className="sm:hidden shadow-lg">
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
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                            />
                        </div>
                        
                        {/* New note button - made more prominent and touch-friendly */}
                        {/* <button
                            onClick={() => {
                                onCreateNote();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center py-3 px-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mb-3"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Note
                        </button> */}
                        
                        {/* Navigation items - bigger touch targets */}
                        <button
                            onClick={() => {
                                setActiveView("notes");
                                setIsMenuOpen(false);
                            }}
                            className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium w-full text-left rounded-r-lg ${
                                activeView === "notes"
                                    ? "border-blue-500 text-blue-700 bg-blue-50"
                                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                            }`}
                        >
                            <FileText className="w-5 h-5 inline mr-3" />
                            Notes
                        </button>
                        <Link href="/groupnotes" className="block w-full">
                            <button
                                className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium w-full text-left rounded-r-lg ${
                                    activeView === "groups"
                                        ? "border-blue-500 text-blue-700 bg-blue-50"
                                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                }`}
                            >
                                <Users className="w-5 h-5 inline mr-3" />
                                Groups
                            </button>
                        </Link>
                    </div>
                    <div className="pt-3 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-4 py-2">
                            <div className="flex-shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-base font-medium text-gray-700">
                                        {profile?.name + "_Goggins" || "User"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {profile?.notesCreated || 0} notes
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop--sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-5 sm:p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-5 sm:mb-6 sticky top-0 bg-white z-10">
                        <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-gray-800">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        >
                            <span className="text-2xl">×</span>
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
}

// Enhanced Note card component for better mobile experience
const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div 
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col ${expanded ? 'col-span-full' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 
                    className={`font-semibold text-base sm:text-lg text-gray-800 break-words ${expanded ? '' : 'line-clamp-2'} cursor-pointer`}
                    onClick={toggleExpand}
                >
                    {note.title}
                </h3>
                <div className="flex gap-2 shrink-0 ml-2">
                    <button
                        onClick={toggleExpand}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={expanded ? "Collapse note" : "Expand note"}
                    >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                        onClick={() => onEdit(note)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(note._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div 
                className={`text-gray-600 break-words ${expanded ? '' : 'line-clamp-3'} flex-1 cursor-pointer`}
                onClick={toggleExpand}
            >
                {note.content}
            </div>
            <div className="flex items-center mt-3 sm:mt-4 text-sm text-gray-400">
                <Calendar size={14} className="mr-1" />
                {new Date(note.createdAt).toLocaleDateString()}
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
    // New state for mobile floating action button visibility
    const [showFab, setShowFab] = useState(false);

    useEffect(() => {
        // Show FAB after initial load, and only on small screens
        const timer = setTimeout(() => {
            if (window.innerWidth < 640) { // sm breakpoint
                setShowFab(true);
            }
        }, 1000);
        
        return () => clearTimeout(timer);
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

    const handleCreateNote = async (title: string, content: string) => {
        if (!title.trim() || !content.trim()) return;
        try {
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
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditNote = async (title: string, content: string) => {
        if (!selectedNote || !title.trim() || !content.trim()) return;
        try {
            const res = await fetch("/api/auth/notes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ noteId: selectedNote._id, title, content }),
            });
            if (!res.ok) throw new Error("Failed to update note");
            setNotes(
                notes.map((n) =>
                    n._id === selectedNote._id ? { ...n, title, content } : n
                )
            );
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
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

    const filteredNotes = notes.filter(
        (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar
                profile={profile}
                activeView={activeView}
                setActiveView={setActiveView}
                onCreateNote={() => setIsCreateModalOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div className="flex-1 min-w-0 flex flex-col">
                <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredNotes.map((note) => (
                            <NoteCard 
                                key={note._id} 
                                note={note} 
                                onEdit={(note) => {
                                    setSelectedNote(note);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={handleDeleteNote}
                            />
                        ))}
                        {filteredNotes.length === 0 && (
                            <div className="text-center py-12 col-span-full">
                                <p className="text-gray-500 text-sm sm:text-base">
                                    No notes found. Create one to get started!
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Floating Action Button for quick note creation */}
            {showFab && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center sm:hidden z-20 hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    aria-label="Create new note"
                >
                    <Plus size={24} />
                </button>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Note"
            >
                <NoteForm
                    onSubmit={handleCreateNote}
                    submitButtonText="Create Note"
                    isSubmitting={isCreating}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Note"
            >
                <NoteForm
                    note={selectedNote}
                    onSubmit={handleEditNote}
                    submitButtonText="Save Changes"
                />
            </Modal>
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
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
            <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Title <span className="text-red-500">*</span>
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
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base
                        ${errors.title && touched.title
                            ? "border-red-500 bg-red-50"
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
                    Content <span className="text-red-500">*</span>
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
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40 text-base resize-none
                        ${errors.content && touched.content
                            ? "border-red-500 bg-red-50"
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
                className="w-full bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium"
            >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {submitButtonText}
            </button>
        </form>
    );
};

export default Dashboard;