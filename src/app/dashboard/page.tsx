"use client";
import React, { useEffect, useState } from "react";
import {
    Trash2,
    Loader2,
    Search,
    Edit,
    Calendar,
} from "lucide-react";
import GroupNotes from "../components/groupnotes";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";

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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 sm:p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white z-10">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
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
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            <Sidebar
                profile={profile}
                activeView={activeView}
                setActiveView={setActiveView}
                onCreateNote={() => setIsCreateModalOpen(true)}
            />

            <div className="flex-1 min-w-0 flex flex-col lg:ml-64">
                    {/* <header className="bg-white shadow-sm p-3 sm:p-4 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="relative flex items-center">
                            <Search
                                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                size={16} // Smaller base size for mobile
                            />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                            />
                        </div>
                    </div>
                </header> */}

                {/* <header> */}
                {/* <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                
                 </header> */}

                <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {activeView === "notes" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 break-words line-clamp-2">
                                            {note.title}
                                        </h3>
                                        <div className="flex gap-1 sm:gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setSelectedNote(note);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 break-words line-clamp-3 flex-1">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
                                        <Calendar size={12} className="mr-1" />
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {filteredNotes.length === 0 && (
                                <div className="text-center py-12 col-span-full">
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        No notes found. Create one to get started!
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <GroupNotes />
                    )}
                </main>
            </div>

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
                    className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base
                        ${errors.title && touched.title
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                    placeholder="Enter note title..."
                />
                {errors.title && touched.title && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.title}</p>
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
                    className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 sm:h-40 md:h-48 text-sm sm:text-base resize-none
                        ${errors.content && touched.content
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                    placeholder="Enter note content..."
                />
                {errors.content && touched.content && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.content}</p>
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
                className="w-full bg-blue-500 text-white rounded-lg p-2 sm:p-3 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {submitButtonText}
            </button>
        </form>
    );
};

export default Dashboard;