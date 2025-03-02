"use client";
import React, { useEffect, useState } from "react";
import { Plus, Loader2, ChevronDown, X, ChevronRight, ArrowLeft, Eye, EyeOff, Trash2, Edit } from "lucide-react";
import Link from "next/link";

type GroupNote = {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    groupId: string;
    notes: string[]; // Array of note IDs that belong to this group
    noteObjects: Note[] // Array of note objects that belong to this group
    is_deleted: boolean;
};

type Note = {
    _id: string;
    title: string;
    content: string;
    is_deleted: boolean;
};

type EditGroupDataType = {
    name: string;
    description: string;
    notes: string[];
};

const GroupNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [groupNotes, setGroupNotes] = useState<GroupNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
    const [newGroupNote, setNewGroupNote] = useState({ name: "", description: "" });
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [expandedContents, setExpandedContents] = useState<Record<string, boolean>>({});
    const [expandAll, setExpandAll] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editGroupData, setEditGroupData] = useState<EditGroupDataType>({ 
        name: "", 
        description: "", 
        notes: [] 
    });

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

                const activeGroupNotes = groupNotesRes2.filter((group: GroupNote) => !group.is_deleted);
                
                // Enhance group notes with their actual note objects
                const enhancedGroupNotes = activeGroupNotes.map((group: GroupNote) => {
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

    const handleEditGroupNote = async (groupId: string) => {
        try {
            setIsCreating(true); // Reuse the loading state
            const res = await fetch("/api/auth/groupnote", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    groupId: groupId,
                    name: editGroupData.name, 
                    description: editGroupData.description, 
                    notes: editGroupData.notes 
                }),
                credentials: "include",
            });
    
            if (!res.ok) throw new Error("Failed to update group note");
    
            const data = await res.json();
            
            // Update the group note in the local state
            setGroupNotes(prev => prev.map(group => 
                group._id === groupId 
                    ? { 
                        ...group, 
                        name: editGroupData.name,
                        description: editGroupData.description,
                        notes: editGroupData.notes,
                        noteObjects: notes.filter(note => editGroupData.notes.includes(note._id))
                      } 
                    : group
            ));
            
            // Reset editing state
            setIsEditing(null);
            setEditGroupData({ name: "", description: "", notes: [] });
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const startEditing = (group: GroupNote) => {
        setEditGroupData({
            name: group.name,
            description: group.description,
            notes: group.notes || []
        });
        setSelectedNotes(group.noteObjects || []);
        setIsEditing(group._id);
        setIsModalOpen(true);
    };

    const handleDeleteGroupNote = async (id: string) => {
        try {
            // Set deleting state for this specific group note
            setIsDeleting(prev => ({ ...prev, [id]: true }));
            
            const res = await fetch("/api/auth/groupnote", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ groupId: id, is_deleted: true }),
            });

            if (!res.ok) throw new Error("Failed to delete group note");

            // Remove the group note from the state
            setGroupNotes(groupNotes.filter(group => group._id !== id));
            setDeleteConfirmationId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNotes(prev => 
            prev.some(n => n._id === note._id) 
                ? prev.filter(n => n._id !== note._id) 
                : [...prev, note]
        );

        // Update editGroupData.notes accordingly if in edit mode
        if (isEditing) {
            setEditGroupData(prev => {
                const noteId = note._id;
                const isAlreadySelected = prev.notes.includes(noteId);
                
                return {
                    ...prev,
                    notes: isAlreadySelected
                        ? prev.notes.filter(id => id !== noteId)
                        : [...prev.notes, noteId]
                };
            });
        }
    };

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const toggleContentExpansion = (noteId: string, e: React.MouseEvent) => {
        // Stop event propagation to prevent toggling the note expansion
        e.stopPropagation();
        setExpandedContents(prev => ({
            ...prev,
            [noteId]: !prev[noteId]
        }));
    };

    // Toggle expand/collapse all groups
    const toggleExpandAll = () => {
        const newExpandState = !expandAll;
        setExpandAll(newExpandState);
        
        // Create a new object with all groups either expanded or collapsed
        const groupExpansionState: Record<string, boolean> = {};
        groupNotes.forEach(group => {
            groupExpansionState[group._id] = newExpandState;
        });
        
        setExpandedGroups(groupExpansionState);
        
        // If collapsing all, also collapse all contents
        if (!newExpandState) {
            setExpandedContents({});
        }
    };

    if (isLoading) {
        return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-500">Loading your group notes...</p>
                </div>
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
                            <h1 className="text-xl font-bold text-gray-800">NoteBook Groups</h1> 
                        </div>
                        
                        {/* Expand/Collapse All Button */}
                        {groupNotes.length > 0 && (
                            <button
                                onClick={toggleExpandAll}
                                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {expandAll ? (
                                    <>
                                        <EyeOff size={16} className="mr-1" />
                                        Collapse All
                                    </>
                                ) : (
                                    <>
                                        <Eye size={16} className="mr-1" />
                                        Expand All
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow px-4 py-6 sm:px-6 max-w-7xl mx-auto w-full">
                {groupNotes.length > 0 ? (
                    <div className="grid gap-4">
                        {groupNotes.map(groupNote => (
                            <div key={groupNote._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                {/* Group Header - Clickable to expand */}
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div 
                                        className="flex-grow mr-2"
                                        onClick={() => toggleGroupExpansion(groupNote._id)}
                                    >
                                        <h3 className="font-semibold text-gray-800">{groupNote.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{groupNote.description}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {/* Delete button */}
                                        {deleteConfirmationId === groupNote._id ? (
                                            <div className="flex items-center mr-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmationId(null);
                                                    }}
                                                    className="text-gray-500 hover:text-gray-700 text-xs mr-2 px-2 py-1 rounded"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroupNote(groupNote._id);
                                                    }}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1 rounded flex items-center"
                                                    disabled={isDeleting[groupNote._id]}
                                                >
                                                    {isDeleting[groupNote._id] ? (
                                                        <Loader2 size={12} className="animate-spin mr-1" />
                                                    ) : (
                                                        <Trash2 size={12} className="mr-1" />
                                                    )}
                                                    Confirm
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Edit button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(groupNote);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-500 mr-2 focus:outline-none p-1"
                                                    aria-label="Edit group"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                
                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmationId(groupNote._id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 mr-4 focus:outline-none p-1"
                                                    aria-label="Delete group"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                        
                                        <span className="text-xs font-medium text-gray-500 mr-2">
                                            {groupNote.noteObjects.length} Note{groupNote.noteObjects.length !== 1 ? 's' : ''}
                                        </span>
                                        <ChevronRight 
                                            size={20} 
                                            className={`text-gray-500 transition-transform ${expandedGroups[groupNote._id] ? 'rotate-90' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleGroupExpansion(groupNote._id);
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Expanded Notes Section */}
                                {expandedGroups[groupNote._id] && (
                                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                                        {groupNote.noteObjects && groupNote.noteObjects.length > 0 ? (
                                            <div className="grid gap-3">
                                                {groupNote.noteObjects.map((note: Note) => (
                                                    <div key={note._id} className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200">
                                                        {/* Note Header - Now only toggles content expansion */}
                                                        <div className="p-3 flex justify-between items-center">
                                                            <h4 className="font-medium text-gray-800">{note.title}</h4>
                                                            <button 
                                                                onClick={(e) => toggleContentExpansion(note._id, e)}
                                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                                                            >
                                                                {expandedContents[note._id] ? "Hide Content" : "Show Content"}
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Note Content - Controlled by expandedContents state */}
                                                        <div className="px-3 pb-3 pt-0">
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                {expandedContents[note._id] ? (
                                                                    <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200 mt-1">
                                                                        {note.content}
                                                                    </div>
                                                                ) : (
                                                                    <p className="line-clamp-2 italic">
                                                                        {note.content.substring(0, 100)}
                                                                        {note.content.length > 100 ? "..." : ""}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
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
            
            {/* Floating Action Button */}
            <button 
                onClick={() => {
                    setIsEditing(null);
                    setNewGroupNote({ name: "", description: "" });
                    setSelectedNotes([]);
                    setIsModalOpen(true);
                }} 
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
                aria-label="Create new group note"
            >
                <Plus size={24} />
            </button>
            
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {isEditing ? "Edit Group" : "Create New Group"}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewGroupNote({ name: "", description: "" });
                                    setSelectedNotes([]);
                                    setIsDropdownOpen(false);
                                    setIsEditing(null);
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
                                        value={isEditing ? editGroupData.name : newGroupNote.name} 
                                        onChange={e => isEditing 
                                            ? setEditGroupData(prev => ({ ...prev, name: e.target.value })) 
                                            : setNewGroupNote(prev => ({ ...prev, name: e.target.value }))} 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        id="group-description"
                                        placeholder="Enter description" 
                                        value={isEditing ? editGroupData.description : newGroupNote.description} 
                                        onChange={e => isEditing 
                                            ? setEditGroupData(prev => ({ ...prev, description: e.target.value })) 
                                            : setNewGroupNote(prev => ({ ...prev, description: e.target.value }))} 
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            {/* Notes Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Notes</label>
                                
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <span className="text-sm text-gray-700">
                                            {selectedNotes.length > 0 
                                                ? `${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''} selected` 
                                                : 'Select notes to include'}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-500" />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {notes.length > 0 ? (
                                                <div className="p-2">
                                                    {notes.map(note => (
                                                        <div 
                                                            key={note._id}
                                                            className={`flex items-center p-2 rounded-md cursor-pointer ${
                                                                selectedNotes.some(n => n._id === note._id) 
                                                                    ? 'bg-blue-50 text-blue-700' 
                                                                    : 'hover:bg-gray-50'
                                                            }`}
                                                            onClick={() => handleSelectNote(note)}
                                                        >
                                                            <div className="flex-grow">
                                                                <div className="font-medium">{note.title}</div>
                                                                <div className="text-xs text-gray-500 line-clamp-1">{note.content}</div>
                                                            </div>
                                                            <div className="ml-2">
                                                                {selectedNotes.some(n => n._id === note._id) && (
                                                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">No notes available</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Selected Notes Preview */}
                                {selectedNotes.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-xs font-medium text-gray-500">Selected Notes:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNotes.map(note => (
                                                <div 
                                                    key={note._id}
                                                    className="bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-1 flex items-center"
                                                >
                                                    <span className="line-clamp-1 max-w-xs">{note.title}</span>
                                                    <button 
                                                        onClick={() => handleSelectNote(note)}
                                                        className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
                                    setIsEditing(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={isEditing 
                                    ? () => handleEditGroupNote(isEditing) 
                                    : handleCreateGroupNote} 
                                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={isCreating || 
                                    (isEditing 
                                        ? !editGroupData.name.trim() || !editGroupData.description.trim() || selectedNotes.length === 0 
                                        : !newGroupNote.name.trim() || !newGroupNote.description.trim() || selectedNotes.length === 0)}
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? null : <Plus size={16} />)} 
                                {isEditing ? "Save Changes" : "Create Group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupNotes;