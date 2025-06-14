'use client'
import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertCircle, Clock, FileText } from 'lucide-react';

// Define the Note type based on your API response
interface Note {
  _id: string;
  title: string;
  content?: string;
  userId: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface ApiResponse {
  recentlyDeletedNotes: Note[];
  message: string;
}

const RecentlyDeletedNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentlyDeletedNotes = async () => {
    try {
      setError(null);
      const response = await fetch('/api/recently-deleted', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notes');
      }

      const data: ApiResponse = await response.json();
      setNotes(data.recentlyDeletedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecentlyDeletedNotes();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    fetchRecentlyDeletedNotes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading recently deleted notes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recently Deleted</h1>
                <p className="text-gray-600 mt-1">Your recently deleted notes (last 10)</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error loading notes</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!error && (
          <>
            {notes.length === 0 ? (
              <div className="text-center py-16">
                <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No deleted notes</h3>
                <p className="text-gray-600">You havent deleted any notes recently.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-3 min-w-0">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 truncate max-w-full">
                          {note.title || 'Untitled Note'}
                        </h3>
                      </div>
                    </div>

                    {/* Note Content Preview */}
                    {note.content && (
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed break-words overflow-hidden">
                          {truncateContent(note.content)}
                        </p>
                      </div>
                    )}

                    {/* Note Metadata */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1 break-all">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Created: {formatDate(note.createdAt)}</span>
                      </div>
                      {note.deletedAt && (
                        <div className="flex items-center space-x-1 break-all">
                          <Trash2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Deleted: {formatDate(note.deletedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Note Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                          Restore
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Info */}
            {notes.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Showing {notes.length} recently deleted note{notes.length !== 1 ? 's' : ''}</p>
                <p className="mt-1">We never delete notes automatically, so you can rest peacefully</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentlyDeletedNotes;