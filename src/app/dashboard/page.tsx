"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, X, Loader2, Menu, Search } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setTitle("");
        setContent("");
        setError("");
        setIsCreateModalOpen(false);
    };

    // Create Note
    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="mr-3 text-gray-600 md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Goggins Notes</h1>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                    >
                        <Plus size={24} />
                    </button>
                </div>
                
                {/* Search bar */}
                <div className="p-4 pt-0 pb-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 z-20">
                    <div className="bg-white w-64 h-full p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        {/* Add your menu items here */}
                    </div>
                </div>
            )}

            {/* Notes list */}
            <div className="mt-32 px-4 pb-4">
                <div className="max-w-2xl mx-auto space-y-4">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                            <div
                                key={note._id}
                                className="bg-white p-4 rounded-lg shadow-sm relative group"
                            >
                                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                                <p className="text-gray-600 mt-1">{note.content}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                                <button
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No notes found</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 text-blue-500 hover:text-blue-600"
                            >
                                Create your first note
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create note modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Create a New Note</h2>
                            {error && <p className="text-red-500 mb-2">{error}</p>}
                            <form onSubmit={handleCreateNote}>
                                <input
                                    type="text"
                                    placeholder="Note Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <textarea
                                    placeholder="Note Content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isCreating ? 'Creating...' : 'Create Note'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;