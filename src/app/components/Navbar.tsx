import { ChevronLeft, ChevronRight, FileText, LogOut, Menu, Plus, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Profile = {
    name: string;
    notesCreated: number;
    avatar?: string;
};

interface NavbarProps {
  profile: Profile | null;
  notesCount: number;
  activeView: "notes" | "groups";
  setActiveView: (view: "notes" | "groups") => void;
  onCreateNote: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void; // Add this new prop
}

const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeView,
  setActiveView,
  onCreateNote,
  searchQuery,
  setSearchQuery,
  notesCount,
  onLogout,
}) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const getInitials = (name: any) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 hidden md:flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Goggins NoteBook
            </span>
          )}
          {isSidebarCollapsed && (
            <span className="mx-auto text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              GN
            </span>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col overflow-y-auto py-4">
          {/* Profile Section */}
          <div className={`px-4 mb-6 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <Link href="/profileinnotes" className={`flex items-center ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} p-2 rounded-lg hover:bg-gray-50`}>
              <div className="flex-shrink-0">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.name}'s avatar`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {profile ? getInitials(profile.name) : "U"}
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3 flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.name + "_Goggins" || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notesCount || 0} notes
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Search Bar */}
          {!isSidebarCollapsed && (
            <div className="px-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="px-2 space-y-1">
            <button
              onClick={() => setActiveView("notes")}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} w-full px-3 py-3 text-sm font-medium rounded-md ${
                activeView === "notes"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileText className={`w-5 h-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Notes</span>}
            </button>
            
            <Link href="/groupnotes" className="block w-full">
            <button
  onClick={() => {
    setActiveView("groups");
    router.push("/groupnotes");
  }}
  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} w-full px-3 py-3 text-sm font-medium rounded-md ${
    activeView === "groups"
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  }`}
>
  <Users className={`w-5 h-5 ${!isSidebarCollapsed && 'mr-3'}`} />
  {!isSidebarCollapsed && <span>Groups</span>}
</button>
            </Link>
          </div>

          {/* Create Note Button */}
          <div className="px-4 mt-4">
            <button
              onClick={onCreateNote}
              className={`inline-flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all w-full`}
            >
              <Plus className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="ml-2">Create Note</span>}
            </button>
          </div>

          {/* Spacer to push logout to bottom */}
          <div className="flex-1"></div>

          {/* Logout Button */}
          <div className="px-4 mb-6">
            <button
              onClick={onLogout}
              className={`inline-flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm transition-all w-full`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header and Sidebar */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Goggins NoteBook
          </span>
          
          <div className="flex-shrink-0">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.name}'s avatar`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                {profile ? getInitials(profile.name) : "U"}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Dark overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setMobileSidebarOpen(false)}
            ></div>
            
            {/* Sidebar content */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 pt-2 pr-2">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="px-4 flex items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Goggins NoteBook
                  </span>
                </div>
                
                {/* Profile Section */}
                <div className="mt-5 px-4">
                  <Link href="/profileinnotes" className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-300">
                    <div className="flex-shrink-0">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={`${profile.name}'s avatar`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                          {profile ? getInitials(profile.name) : "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {profile?.name + "_Goggins" || "User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {notesCount || 0} notes
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Search */}
                <div className="px-4 mt-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    />
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="mt-6 px-4 space-y-2">
                  <button
                    onClick={() => {
                      setActiveView("notes");
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg ${
                      activeView === "notes"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Notes
                  </button>
                  
                  <Link href="/groupnotes" className="block w-full">
                  <button
                    onClick={() => {
                        setActiveView("groups");
                        setMobileSidebarOpen(false);
                        router.push("/groupnotes");
                    }}
                    className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg ${
                        activeView === "groups"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    >
                    <Users className="w-5 h-5 mr-3" />
                    Groups
                    </button>

                  </Link>

                  {/* Create Note Button */}
                  <button
                    onClick={() => {
                      onCreateNote();
                      setMobileSidebarOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Note
                  </button>
                </nav>
              </div>
              
              {/* Logout Button */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={onLogout}
                  className="flex items-center justify-start w-full px-4 py-3 text-base font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;