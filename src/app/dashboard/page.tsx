"use client";
import { FaLightbulb, FaBell, FaPen, FaDownload, FaTrash, FaThumbtack } from "react-icons/fa";
import { useEffect, useState } from "react";

type Note = {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    pinned?: boolean;
};

const Dashboard = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    // Fetch notes when component loads
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/notes", {
                    credentials: "include", // ✅ Send cookies
                });
    
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch notes");
    
                setNotes(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load notes");
            }
        };
        fetchNotes();
    }, []);
    

    // Create Note
    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setError("Title and Content are required!");
            return;
        }
    
        try {
            fetch('/api/notes').then(res => res.json()).then(console.log).catch(console.error);

            const res = await fetch("/api/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content }),
                credentials: "include", // ✅ Send cookies with the request
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create note");
    
            setNotes([data.note, ...notes]); // Add new note to UI
            setTitle("");
            setContent("");
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to create note");
        }
    };
    

    // Delete Note
    const handleDeleteNote = async (id: string) => {
        try {
            const res = await fetch("/api/notes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: id }),
            });

            if (!res.ok) throw new Error("Failed to delete note");

            setNotes((prev) => prev.filter((note) => note._id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete note");
        }
    };

    // Pin/Unpin Note
    const handlePinNote = (id: string) => {
        setNotes((prev) =>
            prev.map((note) => (note._id === id ? { ...note, pinned: !note.pinned } : note))
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
            {/* Sidebar for Desktop | Bottom Nav for Mobile */}
            <aside className="hidden md:flex w-16 bg-gray-800 flex-col items-center py-5 space-y-8">
                <FaLightbulb size={24} className="text-yellow-400 cursor-pointer" />
                <FaBell size={20} className="cursor-pointer" />
                <FaPen size={20} className="cursor-pointer" />
                <FaDownload size={20} className="cursor-pointer" />
                <FaTrash size={20} className="cursor-pointer" />
            </aside>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-800 flex justify-around py-3 border-t border-gray-700">
                <FaLightbulb size={24} className="text-yellow-400 cursor-pointer" />
                <FaBell size={20} className="cursor-pointer" />
                <FaPen size={20} className="cursor-pointer" />
                <FaDownload size={20} className="cursor-pointer" />
                <FaTrash size={20} className="cursor-pointer" />
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 pb-20 md:pb-6 w-full max-w-5xl mx-auto">
                {/* Create Note Section */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-center mb-4">Create a Note</h2>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <form onSubmit={handleCreateNote} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            placeholder="Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition duration-300"
                        >
                            Add Note
                        </button>
                    </form>
                </div>

                {/* Notes Grid */}
                <h2 className="text-2xl font-semibold text-center mt-8">Your Notes</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {notes.length > 0 ? (
                        notes
                            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                            .map((note) => (
                                <div
                                    key={note._id}
                                    className="relative p-6 bg-gray-700 rounded-2xl shadow-md text-white w-full"
                                >
                                    {/* Pin Button */}
                                    <FaThumbtack
                                        className={`absolute top-3 right-3 cursor-pointer ${
                                            note.pinned ? "text-yellow-400" : "text-gray-500"
                                        }`}
                                        size={18}
                                        onClick={() => handlePinNote(note._id)}
                                    />

                                    {/* Note Content */}
                                    <h3 className="text-lg font-semibold">{note.title}</h3>
                                    <p className="mt-2">{note.content}</p>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Created: {new Date(note.createdAt).toLocaleString()}
                                    </p>

                                    {/* Delete Button */}
                                    <FaTrash
                                        size={18}
                                        className="absolute bottom-3 right-3 text-red-400 cursor-pointer hover:text-red-500"
                                        onClick={() => handleDeleteNote(note._id)}
                                    />
                                </div>
                            ))
                    ) : (
                        <p className="text-center col-span-full text-gray-400">No notes found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
