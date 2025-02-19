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
        <div className="min-h-screen bg-white flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Goggins Notes</h1>
            <p className="text-gray-600 mb-6">Stay focused and take charge of your thoughts</p>

            <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                <Plus size={18} className="inline-block mr-2" /> New Note
            </button>

            {isCreateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-semibold mb-4">Create a New Note</h2>
                        {error && <p className="text-red-500 mb-2">{error}</p>}
                        <form onSubmit={handleCreateNote}>
                            <input 
                                type="text" 
                                placeholder="Note Title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                className="w-full p-2 border rounded-lg mb-3"
                            />
                            <textarea 
                                placeholder="Note Content" 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                rows={4} 
                                className="w-full p-2 border rounded-lg mb-3"
                            ></textarea>
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={resetForm} 
                                    className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isCreating} 
                                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    {isCreating ? 'Creating...' : 'Create Note'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-6 w-full max-w-2xl">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note._id} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4 relative">
                            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                            <p className="text-gray-600 mt-1">{note.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <button 
                                onClick={() => handleDeleteNote(note._id)} 
                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center">No notes yet. Start by creating one!</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;