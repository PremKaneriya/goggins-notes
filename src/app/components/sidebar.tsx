"use client";
import React, { useState } from "react";
import { Calendar, ChevronRight, Plus, Menu, X } from "lucide-react";

type Profile = {
    name: string;
    notesCreated: number;
};

interface SidebarProps {
    profile: Profile | null;
    activeView: "notes" | "groups";
    setActiveView: (view: "notes" | "groups") => void;
    onCreateNote: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    profile,
    activeView,
    setActiveView,
    onCreateNote,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Fixed Sidebar for Desktop */}
            <div className="hidden lg:block fixed top-0 left-0 h-screen w-64 bg-white shadow-lg overflow-y-auto">
                <div className="p-6 mt-0 flex flex-col h-full">
                    <div className="mb-8">
                        <h1 className="font-bold text-2xl text-gray-900 truncate">
                            {profile ? `${profile.name} Goggins` : "Loading profile..."}
                        </h1>
                    </div>

                    <div className="flex-1 space-y-6">
                        <button
                            onClick={onCreateNote}
                            className="w-full bg-blue-500 text-white rounded-lg p-3 
                                flex items-center justify-center gap-2 
                                hover:bg-blue-600 transition-all duration-300 
                                shadow-md hover:shadow-lg font-semibold 
                                focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <Plus size={20} />
                            <span>New Note</span>
                        </button>

                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveView("notes")}
                                className={`w-full p-3 rounded-xl flex items-center gap-3 
                                    ${
                                        activeView === "notes"
                                            ? "bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-inner shadow-blue-200/50"
                                            : "bg-white text-gray-700 border-2 border-blue-300 hover:bg-gray-50 hover:text-blue-600"
                                    } 
                                    transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            >
                                <Calendar size={20} />
                                <span>My Notes</span>
                            </button>

                            <button
                                onClick={() => setActiveView("groups")}
                                className={`w-full p-3 rounded-xl flex items-center gap-3 
                                    ${
                                        activeView === "groups"
                                            ? "bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-inner shadow-blue-200/50"
                                            : "bg-white text-gray-700 border-2 border-blue-300 hover:bg-gray-50 hover:text-blue-600"
                                    } 
                                    transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            >
                                <ChevronRight size={20} />
                                <span>Group Notes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center fixed bottom-8 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`
                lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300
                ${isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }
            `}
            >
                {/* Mobile Menu Container */}
                <div
                    className={`
                    fixed inset-y-0 left-0 w-64 bg-white shadow-xl 
                    transform transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
                >
                    <div className="flex flex-col p-4">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-lg font-semibold text-gray-900 truncate">
                                {profile ? `${profile.name} Goggins` : "Loading profile..."}
                            </h1>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md">
                            <button
                                onClick={() => {
                                    onCreateNote();
                                    setIsOpen(false);
                                }}
                                className="w-full bg-blue-500 text-white rounded-lg p-3 
                                    flex items-center justify-center gap-2 
                                    hover:bg-blue-600 transition-all duration-300 
                                    shadow-md hover:shadow-lg font-semibold 
                                    focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <Plus size={20} />
                                <span>New Note</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveView("notes");
                                    setIsOpen(false);
                                }}
                                className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Calendar size={20} className="mr-3" />
                                <span className="font-medium">My Notes</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveView("groups");
                                    setIsOpen(false);
                                }}
                                className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight size={20} className="mr-3" />
                                <span className="font-medium">Group Notes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;