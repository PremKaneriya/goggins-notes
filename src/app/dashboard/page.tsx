"use client";

import { useEffect, useState } from "react";
import { Trash2, Pin, Plus, X, Loader2, ChevronLeft, Menu } from 'lucide-react';

type Note = {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    is_deleted: boolean;
};

const Dashboard = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fetch notes when component loads
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/auth/notes", {
                    credentials: "include",
                });
    
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch notes");
    
                setNotes(data.filter((note: Note) => !note.is_deleted));
            } catch (err) {
                console.error(err);
                setError("Failed to load notes");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setError("");
        setIsCreateModalOpen(false);
    };

    // Create Note
    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setError("Title and Content are required!");
            return;
        }
    
        try {
            setIsCreating(true);
            const res = await fetch("/api/auth/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content }),
                credentials: "include",
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create note");
    
            setNotes([data.note, ...notes]);
            resetForm();
        } catch (err) {
            console.error(err);
            setError("Failed to create note");
        } finally {
            setIsCreating(false);
        }
    };

    // Delete Note
    const handleDeleteNote = async (id: string) => {
        try {
            const res = await fetch("/api/auth/notes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: id }),
            });

            if (!res.ok) throw new Error("Failed to delete note");

            setNotes(notes.filter((note) => note._id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete note");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Mobile Header */}
            <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
                <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        My Notes
                    </h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-500 p-3 rounded-full hover:bg-blue-600 transition-colors md:hidden"
                    >
                        <Plus size={20} className="text-white" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition duration-300"
                    >
                        <Plus size={20} />
                        New Note
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4">
                {/* Create Note Modal - Full Screen on Mobile */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-gray-900 md:bg-black/50 flex flex-col md:items-center md:justify-center z-50">
                        <div className="bg-gray-900 md:bg-gray-800 w-full md:max-w-md md:rounded-xl md:shadow-2xl text-white min-h-screen md:min-h-0">
                            {/* Mobile Modal Header */}
                            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 p-4 flex items-center gap-4 md:hidden">
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <h2 className="text-lg font-semibold">Create New Note</h2>
                            </div>

                            {/* Desktop Modal Header */}
                            <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-700">
                                <h2 className="text-xl font-semibold">Create New Note</h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-white transition duration-300"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-4">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateNote} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Note Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 md:bg-gray-700 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-300"
                                    />
                                    <textarea
                                        placeholder="Note Content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-gray-800 md:bg-gray-700 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-300 resize-none"
                                    />
                                    
                                    {/* Mobile Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="md:hidden fixed bottom-4 right-4 left-4 bg-blue-500 rounded-lg py-3 hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Note'
                                        )}
                                    </button>

                                    {/* Desktop Buttons */}
                                    <div className="hidden md:flex gap-3">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="flex-1 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Note'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Grid - Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
                    {notes.length > 0 ? (
                        notes
                            .map((note) => (
                                <div
                                    key={note._id}
                                    className={`group relative p-4 md:p-6 rounded-xl transition duration-300`}
                                >
                                    {/* Mobile-friendly Actions */}
                                    <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-2">
                                        <button
                                            onClick={() => handleDeleteNote(note._id)}
                                            className="p-2 md:p-1.5 rounded-full bg-gray-700 text-gray-400 md:opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-red-500/20 hover:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Content with better mobile spacing */}
                                    <div className="space-y-2 md:space-y-3 text-white">
                                        <h3 className="text-lg font-semibold pr-16 line-clamp-2">{note.title}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-3">{note.content}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <p className="text-center mb-2">No notes yet</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-blue-400 hover:text-blue-300 transition duration-300"
                            >
                                Create your first note
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;