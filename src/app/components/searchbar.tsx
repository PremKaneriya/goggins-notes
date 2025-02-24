import React from "react";
import { Search, Menu } from "lucide-react";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
    return (
        <header className="bg-white shadow-sm p-3 sm:p-4 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto w-full flex items-center">
                {/* Sidebar Toggle Button (Overlapping on the left) */}
                {/* Search Input with Search Icon on the right */}
                <div className="relative w-full flex-1">
                    <Search
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={16} // Smaller base size for mobile
                    />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1.5 sm:py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                    />
                </div>
            </div>
        </header>
    );
};

export default SearchBar;