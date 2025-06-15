
import React from 'react';
import { format } from 'date-fns';

interface Note {
  id: string;
  text: string;
  created_at: string;
  author: string;
  item_id: string;
  item_type: string;
}

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
}

const NotesList = ({ notes, isLoading }: NotesListProps) => {
  if (isLoading) {
    return (
      <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-3 p-3 bg-sage-50 rounded-lg">
        <p className="text-sage-600 text-center py-4 text-sm">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-3 p-3 bg-sage-50 rounded-lg">
        <p className="text-sage-600 text-center py-4 text-sm">No notes yet. Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-3 p-3 bg-sage-50 rounded-lg">
      {notes.map((note) => (
        <div key={note.id} className="bg-white p-3 rounded-lg border border-sage-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
            <span className="font-medium text-emerald-700 text-sm">{note.author}</span>
            <span className="text-xs text-sage-500">
              {format(new Date(note.created_at), 'MMM d, HH:mm')}
            </span>
          </div>
          <p className="text-sage-700 text-sm break-words">{note.text}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
