
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { useTeamNotes } from './team-notes/useTeamNotes';
import NotesList from './team-notes/NotesList';
import AddNoteForm from './team-notes/AddNoteForm';

interface TeamNotesProps {
  itemId: string;
  itemType: 'action' | 'social_post';
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeamNotes = ({ itemId, itemType, itemTitle, isOpen, onClose }: TeamNotesProps) => {
  const { notes, staff, isLoading, addNote } = useTeamNotes(itemId, itemType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Team Notes: {itemTitle.substring(0, 30)}...</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <NotesList notes={notes} isLoading={isLoading} />
          <AddNoteForm staff={staff} onAddNote={addNote} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNotes;
