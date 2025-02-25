"use client";
import React, { useEffect, useState } from "react";
import { Plus, Loader2, ChevronDown, X, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

type GroupNote = {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    groupId: string;
    notes: string[]; // Array of note IDs that belong to this group
    noteObjects: string[] // Array of note objects that belong to this group
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
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

                const [notesData, groupNotesRes2] = await Promise.all([
                    notesRes.json(),
                    groupNotesRes.json()
                ]);

                // Get notes that are not deleted
                const activeNotes = notesData.filter((n: Note) => !n.is_deleted);
                setNotes(activeNotes);
                
                // Enhance group notes with their actual note objects
                const enhancedGroupNotes = groupNotesRes2.map((group: GroupNote) => {
                    return {
                        ...group,
                        noteObjects: activeNotes.filter((note: Note) => 
                            group.notes && group.notes.includes(note._id)
                        )
                    };
                });
                
                setGroupNotes(enhancedGroupNotes);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateGroupNote = async () => {
        if (!newGroupNote.name.trim() || !newGroupNote.description.trim() || selectedNotes.length === 0) {
            return;
        }

        try {
            setIsCreating(true);
            const res = await fetch("/api/auth/groupnote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    ...newGroupNote, 
                    notes: selectedNotes.map(n => n._id) 
                }),
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to create group note");

            const data = await res.json();
            
            // Add note objects to the new group for immediate display
            const newGroupWithNotes = {
                ...data.groupNote,
                noteObjects: selectedNotes
            };
            
            setGroupNotes(prev => [newGroupWithNotes, ...prev]);
            setNewGroupNote({ name: "", description: "" });
            setSelectedNotes([]);
            setIsModalOpen(false);
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

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" size={24} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header with back button */}
            <header className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-gray-900 mr-4">
                                <ArrowLeft size={20} className="mr-1" />
                                <span className="text-sm font-medium">Back</span>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-800">Group Notes</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow px-4 py-6 sm:px-6 max-w-7xl mx-auto w-full">
                {groupNotes.length > 0 ? (
                    <div className="grid gap-4">
                        {groupNotes.map(groupNote => (
                            <div key={groupNote._id} className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Group Header - Clickable to expand */}
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleGroupExpansion(groupNote._id)}
                                >
                                    <div className="flex-grow mr-2">
                                        <h3 className="font-semibold text-gray-800">{groupNote.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{groupNote.description}</p>
                                    </div>
                                    <ChevronRight 
                                        size={20} 
                                        className={`text-gray-500 transition-transform ${expandedGroups[groupNote._id] ? 'rotate-90' : ''}`}
                                    />
                                </div>
                                
                                {/* Expanded Notes Section */}
                                {expandedGroups[groupNote._id] && (
                                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                                        {groupNote.noteObjects && groupNote.noteObjects.length > 0 ? (
                                            <div className="grid gap-3">
                                                {groupNote.noteObjects.map((note: any) => (
                                                    <div key={note._id} className="bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                                        <h4 className="font-medium text-gray-800">{note.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{note.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic py-2">No notes in this group</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-600 mb-4">No group notes yet. Create your first group!</p>
                    </div>
                )}
            </main>
            
            {/* Floating Action Button - More mobile friendly with larger touch target */}
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
                aria-label="Create new group note"
            >
                <Plus size={24} />
            </button>
            
            {/* Modal - Improved for mobile */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Create New Group</h3>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewGroupNote({ name: "", description: "" });
                                    setSelectedNotes([]);
                                    setIsDropdownOpen(false);
                                }}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow">
                            {/* Group Details */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                    <input 
                                        id="group-name"
                                        type="text" 
                                        placeholder="Enter group name" 
                                        value={newGroupNote.name} 
                                        onChange={e => setNewGroupNote(prev => ({ ...prev, name: e.target.value }))} 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        id="group-description"
                                        placeholder="Enter description" 
                                        value={newGroupNote.description} 
                                        onChange={e => setNewGroupNote(prev => ({ ...prev, description: e.target.value }))} 
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            {/* Notes Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Notes</label>
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsDropdownOpen(prev => !prev)} 
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <span className="truncate">
                                            {selectedNotes.length > 0 
                                                ? `${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''} selected` 
                                                : "Select notes to include"}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                                            {notes.length > 0 ? (
                                                notes.map(note => (
                                                    <div 
                                                        key={note._id} 
                                                        className={`px-3 py-2 cursor-pointer ${
                                                            selectedNotes.some(n => n._id === note._id) 
                                                                ? 'bg-blue-50 text-blue-700' 
                                                                : 'hover:bg-gray-50'
                                                        }`} 
                                                        onClick={() => handleSelectNote(note)}
                                                    >
                                                        <div className="font-medium truncate">{note.title}</div>
                                                        <div className="text-xs text-gray-500 truncate">{note.content.substring(0, 60)}...</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-4 text-center text-gray-500">No notes available</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {selectedNotes.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedNotes.map(note => (
                                            <div key={note._id} className="bg-blue-50 text-blue-700 text-sm px-2 py-1 rounded-md flex items-center">
                                                <span className="truncate max-w-[150px]">{note.title}</span>
                                                <button 
                                                    onClick={() => handleSelectNote(note)} 
                                                    className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                                                    aria-label={`Remove ${note.title}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewGroupNote({ name: "", description: "" });
                                    setSelectedNotes([]);
                                }}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateGroupNote} 
                                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={isCreating || !newGroupNote.name.trim() || !newGroupNote.description.trim() || selectedNotes.length === 0}
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupNotes;