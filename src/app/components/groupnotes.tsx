"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react";

// Define the GroupNote type
type GroupNote = {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    groupId: string;
};

type Note = {
    _id: string;
    title: string;
    content: string;
    is_deleted: boolean;
};

const GroupNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [groupNotes, setGroupNotes] = useState<GroupNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupNote, setNewGroupNote] = useState({ name: "", description: "" });
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/auth/notes", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch notes");
                const data = await res.json();
                setNotes(data.filter((n: { is_deleted: boolean; }) => !n.is_deleted));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleCreateGroupNote = async () => {
        if (!newGroupNote.name.trim() || !newGroupNote.description.trim()) return;
        try {
            setIsCreating(true);
            const res = await fetch("/api/auth/groupnote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newGroupNote, notes: selectedNotes.map(n => n._id) }),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to create group note");
            const data = await res.json();
            setGroupNotes([data.groupNote, ...groupNotes]);
            setNewGroupNote({ name: "", description: "" });
            setSelectedNotes([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNotes((prev) => {
            if (prev.some((n) => n._id === note._id)) {
                return prev.filter((n) => n._id !== note._id);
            }
            return [...prev, note];
        });
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Group Notes</h2>
            
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-gray-100 p-2 rounded-lg flex justify-between items-center"
                >
                    {selectedNotes.length > 0 ? selectedNotes.map(n => n.title).join(", ") : "Select notes"}
                    <ChevronDown size={16} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute w-full bg-white border mt-2 shadow-lg rounded-lg max-h-60 overflow-y-auto">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className={`p-2 cursor-pointer ${selectedNotes.some(n => n._id === note._id) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                                onClick={() => handleSelectNote(note)}
                            >
                                {note.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedNotes.length > 0 && (
                <div className="mt-4 p-3 border rounded-lg">
                    {selectedNotes.map(note => (
                        <div key={note._id} className="mb-2">
                            <h3 className="font-medium">{note.title}</h3>
                            <p className="text-sm text-gray-600">{note.content}</p> 
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex flex-col gap-2 mt-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={newGroupNote.name}
                    onChange={(e) => setNewGroupNote({ ...newGroupNote, name: e.target.value })}
                    className="border p-2 rounded-lg"
                />
                <textarea
                    placeholder="Description"
                    value={newGroupNote.description}
                    onChange={(e) => setNewGroupNote({ ...newGroupNote, description: e.target.value })}
                    className="border p-2 rounded-lg h-20"
                />
                <button 
                    onClick={handleCreateGroupNote} 
                    className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center"
                    disabled={isCreating}
                >
                    {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Add Group Note
                </button>
            </div>
        </div>
    );
};

export default GroupNotes;
