"use client";
import React, { useEffect, useState } from "react";
import { Plus, Loader2, ChevronDown, X } from "lucide-react";

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
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [notesRes, groupNotesRes] = await Promise.all([
                    fetch("/api/auth/notes", { credentials: "include" }),
                    fetch("/api/auth/groupnote", { credentials: "include" })
                ]);

                if (!notesRes.ok || !groupNotesRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [notesData, groupNotesData] = await Promise.all([
                    notesRes.json(),
                    groupNotesRes.json()
                ]);

                setNotes(notesData.filter((n: Note) => !n.is_deleted));
                setGroupNotes(groupNotesData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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
            setGroupNotes(prev => [data.groupNote, ...prev]);
            setNewGroupNote({ name: "", description: "" });
            setSelectedNotes([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNotes(prev => 
            prev.some(n => n._id === note._id) 
                ? prev.filter(n => n._id !== note._id) 
                : [...prev, note]
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" size={24} />
            </div>
        );
    }

    return (
        <div className="p-4 bg-white shadow-md rounded-lg relative">
        <h2 className="text-xl font-semibold mb-4">Group Notes</h2>
        {groupNotes.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Existing Groups</h3>
                <div className="space-y-3">
                    {groupNotes.map(groupNote => (
                        <div key={groupNote._id} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{groupNote.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{groupNote.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {/* Floating Plus Button */}
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg">
            <Plus size={24} />
        </button>
        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Create New Group</h3>
                        <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                    </div>
                    {/* Notes Dropdown */}
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(prev => !prev)} className="w-full bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                            {selectedNotes.length > 0 ? selectedNotes.map(n => n.title).join(", ") : "Select notes"}
                            <ChevronDown size={16} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute w-full bg-white border mt-2 shadow-lg rounded-lg max-h-60 overflow-y-auto z-50">
                                {notes.map(note => (
                                    <div key={note._id} className={`p-2 cursor-pointer ${selectedNotes.some(n => n._id === note._id) ? 'bg-gray-300' : 'hover:bg-gray-200'}`} onClick={() => handleSelectNote(note)}>
                                        {note.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Input Fields */}
                    <div className="flex flex-col gap-2 mt-4">
                        <input type="text" placeholder="Name" value={newGroupNote.name} onChange={e => setNewGroupNote(prev => ({ ...prev, name: e.target.value }))} className="border p-2 rounded-lg" />
                        <textarea placeholder="Description" value={newGroupNote.description} onChange={e => setNewGroupNote(prev => ({ ...prev, description: e.target.value }))} className="border p-2 rounded-lg h-20" />
                        <button onClick={handleCreateGroupNote} className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2" disabled={isCreating}>
                            {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Add Group Note
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default GroupNotes;
