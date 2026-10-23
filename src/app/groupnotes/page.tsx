"use client";
import React, { useEffect, useState } from "react";
import { Plus, Loader2, ChevronDown, X, ChevronRight, ArrowLeft, Eye, EyeOff, Trash2, Edit, FilePlus, Search, FolderPlus, FileText, FileX, Check, FileDown } from "lucide-react";
import Link from "next/link";
import { fetchAndExportGroupNote } from "@/utils/GroupPdfExport";

type GroupNote = {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    groupId: string;
    notes: string[];
    noteObjects: Note[];
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
    const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});
    const [newGroupNote, setNewGroupNote] = useState({ name: "", description: "" });
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [expandedContents, setExpandedContents] = useState<Record<string, boolean>>({});
    const [expandAll, setExpandAll] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [editGroupData, setEditGroupData] = useState<EditGroupDataType>({
        name: "",
        description: "",
        notes: []
    });

    const handleSearchNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = notes.filter(note =>
            note.title.toLowerCase().includes(value.toLowerCase()) ||
            note.content.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredNotes(filtered);
    };

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

                const activeNotes = notesData.filter((n: Note) => !n.is_deleted);
                setNotes(activeNotes);
                setFilteredNotes(activeNotes);

                const activeGroupNotes = groupNotesRes2.filter((g: GroupNote) => !g.is_deleted);
                const enhancedGroupNotes = activeGroupNotes.map((group: GroupNote) => ({
                    ...group,
                    noteObjects: activeNotes.filter((note: Note) =>
                        group.notes && group.notes.includes(note._id)
                    )
                }));

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
            setIsCreating(true);
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

            setIsEditing(null);
            setEditGroupData({ name: "", description: "", notes: [] });
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleExportGroupNote = async (groupId: string) => {
        try {
            setIsExporting(prev => ({ ...prev, [groupId]: true }));
            const success = await fetchAndExportGroupNote(groupId);
            if (!success) {
                console.warn("Failed to export group note");
            }
        } catch (err) {
            console.error("Error exporting group note:", err);
        } finally {
            setIsExporting(prev => ({ ...prev, [groupId]: false }));
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
            setIsDeleting(prev => ({ ...prev, [id]: true }));
            const res = await fetch("/api/auth/groupnote", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ groupId: id, is_deleted: true }),
            });

            if (!res.ok) throw new Error("Failed to delete group note");
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
        e.stopPropagation();
        setExpandedContents(prev => ({
            ...prev,
            [noteId]: !prev[noteId]
        }));
    };

    const toggleExpandAll = () => {
        const newExpandState = !expandAll;
        setExpandAll(newExpandState);
        const groupExpansionState: Record<string, boolean> = {};
        groupNotes.forEach(group => {
            groupExpansionState[group._id] = newExpandState;
        });
        setExpandedGroups(groupExpansionState);
        if (!newExpandState) {
            setExpandedContents({});
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="flex items-center text-slate-700 hover:text-slate-900 transition-colors">
                                <ArrowLeft size={20} className="mr-2" />
                                <span className="text-sm font-medium">Back to Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">My Notebook Collections</h1>
                        </div>
                        {groupNotes.length > 0 && (
                            <button
                                onClick={toggleExpandAll}
                                className="flex items-center text-sm font-medium rounded-full px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                            >
                                {expandAll ? (
                                    <>
                                        <EyeOff size={16} className="mr-2" />
                                        <span>Collapse All</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye size={16} className="mr-2" />
                                        <span>Expand All</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow px-4 py-8 sm:px-6 max-w-7xl mx-auto w-full">
                {groupNotes.length > 0 ? (
                    <div className="grid gap-6">
                        {groupNotes.map(groupNote => (
                            <div key={groupNote._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-300">
                                <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="flex-grow mr-2" onClick={() => toggleGroupExpansion(groupNote._id)}>
                                        <h3 className="font-semibold text-slate-800 text-lg">{groupNote.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{groupNote.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {deleteConfirmationId === groupNote._id ? (
                                            <div className="flex items-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmationId(null);
                                                    }}
                                                    className="text-slate-500 hover:text-slate-700 text-xs mr-2 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroupNote(groupNote._id);
                                                    }}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-3 py-1.5 rounded-md border border-red-200 flex items-center transition-colors"
                                                    disabled={isDeleting[groupNote._id]}
                                                >
                                                    {isDeleting[groupNote._id] ? (
                                                        <Loader2 size={12} className="animate-spin mr-1.5" />
                                                    ) : (
                                                        <Trash2 size={12} className="mr-1.5" />
                                                    )}
                                                    Confirm
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExportGroupNote(groupNote._id);
                                                    }}
                                                    className="text-slate-400 hover:text-green-500 focus:outline-none p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                                    aria-label="Export to PDF"
                                                    disabled={isExporting[groupNote._id]}
                                                >
                                                    {isExporting[groupNote._id] ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <FileDown size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(groupNote);
                                                    }}
                                                    className="text-slate-400 hover:text-blue-500 focus:outline-none p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                                    aria-label="Edit group"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmationId(groupNote._id);
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 focus:outline-none p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                                    aria-label="Delete group"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                                            </>
                                        )}
                                        <span className="text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                                            {groupNote.noteObjects.length} Note{groupNote.noteObjects.length !== 1 ? 's' : ''}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleGroupExpansion(groupNote._id);
                                            }}
                                            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                                        >
                                            <ChevronRight
                                                size={18}
                                                className={`transition-transform duration-300 ${expandedGroups[groupNote._id] ? 'rotate-90' : ''}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                {expandedGroups[groupNote._id] && (
                                    <div className="bg-slate-50 p-5 border-t border-slate-100">
                                        {groupNote.noteObjects && groupNote.noteObjects.length > 0 ? (
                                            <div className="grid gap-4">
                                                {groupNote.noteObjects.map((note) => (
                                                    <div key={note._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 transition-all hover:border-slate-300">
                                                        <div className="p-4 flex justify-between items-center">
                                                            <h4 className="font-medium text-slate-800">{note.title}</h4>
                                                            <button
                                                                onClick={(e) => toggleContentExpansion(note._id, e)}
                                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                            >
                                                                {expandedContents[note._id] ? "Hide Content" : "Show Content"}
                                                            </button>
                                                        </div>
                                                        <div className="px-4 pb-4 pt-0">
                                                            <div className="text-sm text-slate-600">
                                                                {expandedContents[note._id] ? (
                                                                    <div className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200 mt-1">
                                                                        {note.content}
                                                                    </div>
                                                                ) : (
                                                                    <p className="line-clamp-2 italic text-slate-500">
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
                                            <div className="text-center py-8">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                                    <FileText size={20} />
                                                </div>
                                                <p className="text-slate-500 font-medium">No notes in this group yet</p>
                                                <p className="text-xs text-slate-400 mt-1">Notes added to this group will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-lg mx-auto mt-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                            <FolderPlus size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No notebook groups yet</h3>
                        <p className="text-slate-500 mb-6">Create your first group to organize your notes and easily access related content.</p>
                        <button
                            onClick={() => {
                                setIsEditing(null);
                                setNewGroupNote({ name: "", description: "" });
                                setSelectedNotes([]);
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
                        >
                            <Plus size={18} className="mr-1.5" />
                            Create Your First Group
                        </button>
                    </div>
                )}
            </main>

            <button
                onClick={() => {
                    setIsEditing(null);
                    setNewGroupNote({ name: "", description: "" });
                    setSelectedNotes([]);
                    setIsModalOpen(true);
                }}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20 flex items-center justify-center hover:scale-110"
                aria-label="Create new group note"
            >
                <Plus size={24} />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-semibold text-slate-800">
                                {isEditing ? "Edit Notebook Group" : "Create New Notebook Group"}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewGroupNote({ name: "", description: "" });
                                    setSelectedNotes([]);
                                    setIsDropdownOpen(false);
                                    setIsEditing(null);
                                }}
                                className="text-slate-500 hover:text-slate-700 focus:outline-none p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <div className="md:flex flex-col md:flex-row">
                                <div className="md:w-1/2 p-6 md:border-r border-slate-200">
                                    <h4 className="text-lg font-medium text-slate-800 mb-4">Group Details</h4>
                                    <div className="space-y-5">
                                        <div>
                                            <label htmlFor="group-name" className="block text-sm font-medium text-slate-700 mb-1.5">Group Name</label>
                                            <input
                                                id="group-name"
                                                type="text"
                                                placeholder="Enter a descriptive name"
                                                value={isEditing ? editGroupData.name : newGroupNote.name}
                                                onChange={e => isEditing
                                                    ? setEditGroupData(prev => ({ ...prev, name: e.target.value }))
                                                    : setNewGroupNote(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="group-description" className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                            <textarea
                                                id="group-description"
                                                placeholder="What's this group about?"
                                                value={isEditing ? editGroupData.description : newGroupNote.description}
                                                onChange={e => isEditing
                                                    ? setEditGroupData(prev => ({ ...prev, description: e.target.value }))
                                                    : setNewGroupNote(prev => ({ ...prev, description: e.target.value }))}
                                                rows={5}
                                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/2 p-6">
                                    <h4 className="text-lg font-medium text-slate-800 mb-4">Select Notes</h4>
                                    <div className="relative mb-4">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <div className="flex items-center">
                                                <FileText size={16} className="text-slate-400 mr-2" />
                                                <span className="text-sm text-slate-700">
                                                    {selectedNotes.length > 0
                                                        ? `${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''} selected`
                                                        : 'Choose notes to include in this group'}
                                                </span>
                                            </div>
                                            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-sl
ate-200 rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
                                                <div className="sticky top-0 bg-white border-b border-slate-100 p-3 z-10">
                                                    <div className="relative">
                                                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search notes..."
                                                            value={searchTerm}
                                                            onChange={handleSearchNotes}
                                                            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="overflow-y-auto flex-grow">
                                                    {filteredNotes.length > 0 ? (
                                                        <div className="py-2">
                                                            {filteredNotes.map(note => (
                                                                <div
                                                                    key={note._id}
                                                                    className={`flex items-center p-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors ${selectedNotes.some(n => n._id === note._id)
                                                                        ? 'bg-blue-50 border border-blue-200'
                                                                        : 'hover:bg-slate-50 border border-transparent'
                                                                        }`}
                                                                    onClick={() => handleSelectNote(note)}
                                                                >
                                                                    <div className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center ${selectedNotes.some(n => n._id === note._id)
                                                                        ? 'bg-blue-500'
                                                                        : 'border border-slate-300'
                                                                        }`}>
                                                                        {selectedNotes.some(n => n._id === note._id) && (
                                                                            <Check size={12} className="text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="font-medium text-slate-800">{note.title.substring(0, 10)}{note.title.length > 10 ? "..." : ""}</div>
                                                                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{note.content.substring(0, 20)}{note.content.length > 20 ? "..." : ""}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-8 text-center">
                                                            <FileX size={24} className="mx-auto text-slate-300 mb-2" />
                                                            <div className="text-slate-500">No notes available</div>
                                                            <div className="text-xs text-slate-400 mt-1">Create notes first to add them to groups</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 h-64 flex flex-col">
                                        <div className="text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                                            <span>Selected Notes</span>
                                            {selectedNotes.length > 0 && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                    {selectedNotes.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="overflow-y-auto flex-grow">
                                            {selectedNotes.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedNotes.map(note => (
                                                        <div
                                                            key={note._id}
                                                            className="bg-white text-slate-700 text-sm rounded-lg px-3 py-2 flex items-center border border-slate-200 hover:border-slate-300 transition-colors"
                                                        >
                                                            <span className="line-clamp-1 max-w-xs">{note.title.substring(0, 10)}{note.title.length > 10 ? "..." : ""}</span>
                                                            <button
                                                                onClick={() => handleSelectNote(note)}
                                                                className="ml-2 text-slate-400 hover:text-red-500 focus:outline-none"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-400 mb-2">
                                                        <FilePlus size={16} />
                                                    </div>
                                                    <p className="text-slate-500 text-sm">No notes selected yet</p>
                                                    <p className="text-xs text-slate-400 mt-1">Select notes from the dropdown above</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewGroupNote({ name: "", description: "" });
                                    setSelectedNotes([]);
                                    setIsEditing(null);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isEditing
                                    ? () => handleEditGroupNote(isEditing)
                                    : handleCreateGroupNote}
                                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={isCreating ||
                                    (isEditing
                                        ? !editGroupData.name.trim() || !editGroupData.description.trim() || selectedNotes.length === 0
                                        : !newGroupNote.name.trim() || !newGroupNote.description.trim() || selectedNotes.length === 0)}
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? null : <Plus size={16} />)}
                                {isEditing ? "Save Changes" : "Create Notebook Group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupNotes;